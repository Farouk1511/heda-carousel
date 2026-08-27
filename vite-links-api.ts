/**
 * Dev-server API for the Heda short-link generator.
 *
 * The browser must never hold a Supabase service-role key, but the Vite dev server
 * IS a Node process — so the same trick vite-bump-render.ts uses for Remotion works
 * here for privileged database access. `apply: "serve"` keeps this out of any build,
 * and the key is read WITHOUT the `VITE_` prefix so it can never be inlined into the
 * client bundle.
 *
 * Because this only ever runs on localhost, the tool needs no auth of its own.
 *
 *   GET   /api/links                   -> rows from v_link_performance
 *   POST  /api/links                   -> { channel, medium, campaign, ... } -> { code, url }
 *   POST  /api/links/archive           -> { code }
 *   PATCH /api/links/destination       -> { code, destination }
 */
import { randomInt } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";

// Base58: alphanumerics minus the look-alikes 0/O and 1/l/I. Must stay in sync with
// SHORT_CODE_ALPHABET in heda-web's lib/short-links.ts.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const CODE_LENGTH = 4;
const MAX_CODE_ATTEMPTS = 8;

export interface LinksApiOptions {
  supabaseUrl?: string;
  serviceKey?: string;
  siteUrl?: string;
}

interface CreateLinkBody {
  channel?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  label?: string;
  destination?: string;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) reject(new Error("Request body too large."));
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

/** Slugged so a campaign always lands in the database the same way. */
function slug(value: string | undefined, fallback = "") {
  const normalized = (value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function text(value: string | undefined, maxLength = 255) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

export function linksApiPlugin(options: LinksApiOptions = {}): Plugin {
  const supabaseUrl = options.supabaseUrl?.replace(/\/+$/, "") ?? "";
  const serviceKey = options.serviceKey ?? "";
  const siteUrl = (options.siteUrl || "https://tryheda.com").replace(/\/+$/, "");
  const configured = Boolean(supabaseUrl && serviceKey);

  const rest = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
    const raw = await response.text();
    const body = raw ? JSON.parse(raw) : null;
    return { ok: response.ok, status: response.status, body };
  };

  const createLink = async (input: CreateLinkBody) => {
    const channel = slug(input.channel);
    const medium = slug(input.medium);
    const campaign = slug(input.campaign);

    if (!channel || !medium || !campaign) {
      return { error: "Channel, medium and campaign are all required." };
    }

    const destination = text(input.destination) ?? "/";
    if (!destination.startsWith("/")) {
      return { error: "Destination must be a path on the site, starting with '/'." };
    }

    // Retry on the unique-code collision rather than pre-checking, which would race.
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
      const code = generateCode();
      const { ok, status, body } = await rest("tracked_links", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          code,
          destination,
          channel,
          medium,
          campaign,
          content: slug(input.content) || null,
          label: text(input.label),
        }),
      });

      if (ok) {
        const row = Array.isArray(body) ? body[0] : body;
        return { link: { ...row, url: `${siteUrl}/l/${code}` } };
      }

      // 23505 = unique violation: this code is taken, roll another one.
      if (status === 409 && body?.code === "23505") continue;

      return { error: body?.message ?? `Could not create link (HTTP ${status}).` };
    }

    return { error: "Could not find an unused code. Try again." };
  };

  return {
    name: "heda-links-api",
    apply: "serve",
    configureServer(server) {
      if (!configured) {
        server.config.logger.warn(
          "[links] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set - the Links tab will be disabled.",
        );
      } else if (!/localhost|127\.0\.0\.1/.test(supabaseUrl)) {
        // Generating a link writes a real row. If a stale .env has pointed this at
        // the hosted project, that should be impossible to miss.
        server.config.logger.warn(
          `[links] NON-LOCAL Supabase target: ${supabaseUrl}. Links created here are REAL.`,
        );
      }

      server.middlewares.use("/api/links", (req, res) => {
        void (async () => {
          if (!configured) {
            sendJson(res, 503, {
              error:
                "Supabase is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to heda-carousel/.env and restart the dev server.",
            });
            return;
          }

          const url = new URL(req.url ?? "/", "http://localhost");
          const isRoot = url.pathname === "/" || url.pathname === "";

          if (req.method === "GET" && isRoot) {
            const { ok, status, body } = await rest(
              "v_link_performance?select=*&order=created_at.desc",
            );
            if (!ok) {
              sendJson(res, status, { error: body?.message ?? "Could not load links." });
              return;
            }
            sendJson(res, 200, {
              links: (body ?? []).map((row: Record<string, unknown>) => ({
                ...row,
                url: `${siteUrl}/l/${row.code}`,
              })),
              siteUrl,
              target: supabaseUrl,
            });
            return;
          }

          if (req.method === "POST" && isRoot) {
            let payload: CreateLinkBody;
            try {
              payload = JSON.parse(await readBody(req));
            } catch {
              sendJson(res, 400, { error: "Invalid JSON body." });
              return;
            }
            const result = await createLink(payload);
            if (result.error) {
              sendJson(res, 400, { error: result.error });
              return;
            }
            sendJson(res, 200, { link: result.link });
            return;
          }

          if (req.method === "POST" && url.pathname === "/archive") {
            let payload: { code?: string; archived?: boolean };
            try {
              payload = JSON.parse(await readBody(req));
            } catch {
              sendJson(res, 400, { error: "Invalid JSON body." });
              return;
            }
            const code = text(payload.code, 32);
            if (!code) {
              sendJson(res, 400, { error: "A code is required." });
              return;
            }
            const { ok, status, body } = await rest(`tracked_links?code=eq.${encodeURIComponent(code)}`, {
              method: "PATCH",
              body: JSON.stringify({
                archived_at: payload.archived === false ? null : new Date().toISOString(),
              }),
            });
            if (!ok) {
              sendJson(res, status, { error: body?.message ?? "Could not archive link." });
              return;
            }
            sendJson(res, 200, { ok: true });
            return;
          }

          if (req.method === "PATCH" && url.pathname === "/destination") {
            let payload: { code?: string; destination?: string };
            try {
              payload = JSON.parse(await readBody(req));
            } catch {
              sendJson(res, 400, { error: "Invalid JSON body." });
              return;
            }
            const code = text(payload.code, 32);
            const destination = text(payload.destination);
            if (!code || !destination) {
              sendJson(res, 400, { error: "A code and destination are required." });
              return;
            }
            if (!destination.startsWith("/")) {
              sendJson(res, 400, { error: "Destination must start with '/'." });
              return;
            }
            const { ok, status, body } = await rest(`tracked_links?code=eq.${encodeURIComponent(code)}`, {
              method: "PATCH",
              body: JSON.stringify({ destination }),
            });
            if (!ok) {
              sendJson(res, status, { error: body?.message ?? "Could not update destination." });
              return;
            }
            sendJson(res, 200, { ok: true });
            return;
          }

          sendJson(res, 404, { error: "Not found." });
        })().catch((e) => {
          sendJson(res, 500, { error: (e as Error).message });
        });
      });
    },
  };
}

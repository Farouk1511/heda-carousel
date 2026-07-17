/**
 * Dev-server render endpoint for the bump-chart reel.
 *
 * The browser can't encode an MP4 (Remotion renders via headless Chrome +
 * ffmpeg, which are Node-side), but the Vite dev server IS a Node process —
 * so this plugin lets the app render with one click instead of the
 * download-JSON + paste-command dance. Dev-server only (`apply: "serve"`);
 * the JSON + command export remains the path for static builds and CI.
 *
 *   POST /api/bump-render          { data, video } -> { jobId }
 *   GET  /api/bump-render/status?id=<jobId> -> job state + progress
 *   GET  /api/bump-render/file?id=<jobId>   -> the MP4 (attachment)
 */
import fs from "fs";
import path from "path";
import type { IncomingMessage, ServerResponse } from "http";
import type { Plugin } from "vite";
import { parseLeaderboard, weekSlug } from "./src/data/leaderboard/parse";
import { validateDailySteps } from "./src/data/leaderboard/daily";
import { resolveBumpConfig, type BumpReelConfig } from "./src/remotion/bumpChart/config";
import { prefetchAvatars } from "./src/data/leaderboard/avatarsNode";
import type { LeaderboardData } from "./src/data/leaderboard/types";

interface RenderJob {
  id: string;
  state: "bundling" | "rendering" | "done" | "error";
  progress: number;
  error?: string;
  outputPath?: string;
  fileName?: string;
  warnings: string[];
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) reject(new Error("Request body too large."));
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

export function bumpRenderPlugin(): Plugin {
  const jobs = new Map<string, RenderJob>();
  let root = process.cwd();
  let busy = false;

  const runJob = async (
    job: RenderJob,
    data: LeaderboardData,
    config: BumpReelConfig
  ) => {
    try {
      // Heavy Remotion packages load lazily so dev-server startup stays fast.
      const [{ bundle }, { renderMedia, selectComposition }] = await Promise.all([
        import("@remotion/bundler"),
        import("@remotion/renderer"),
      ]);

      // Fresh bundle per render so composition edits are always picked up.
      const serveUrl = await bundle({
        entryPoint: path.resolve(root, "src/remotion/index.ts"),
        webpackOverride: (c) => c,
      });

      const avatars = await prefetchAvatars(data.leaderboard.map((e) => e.imageUrl));
      const inputProps = { data, config, avatars };

      job.state = "rendering";
      const composition = await selectComposition({
        serveUrl,
        id: "BumpChartVideo",
        inputProps,
      });

      const outDir = path.resolve(root, "out");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const fileName = `heda_bumpchart_${weekSlug(data)}_${config.theme}.mp4`;
      const outputLocation = path.join(outDir, fileName);

      await renderMedia({
        composition,
        serveUrl,
        codec: "h264",
        outputLocation,
        inputProps,
        onProgress: ({ progress }) => {
          job.progress = progress;
        },
      });

      job.outputPath = outputLocation;
      job.fileName = fileName;
      job.state = "done";
      job.progress = 1;
    } catch (e) {
      job.state = "error";
      job.error = (e as Error).message;
      console.error(`[bump-render] job ${job.id} failed:`, e);
    } finally {
      busy = false;
    }
  };

  return {
    name: "heda-bump-render",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use("/api/bump-render", (req, res) => {
        void (async () => {
          const url = new URL(req.url ?? "/", "http://localhost");

          if (req.method === "POST" && (url.pathname === "/" || url.pathname === "")) {
            if (busy) {
              sendJson(res, 409, { error: "A render is already running — wait for it to finish." });
              return;
            }
            let payload: { data?: unknown; video?: Partial<BumpReelConfig> };
            try {
              payload = JSON.parse(await readBody(req));
            } catch {
              sendJson(res, 400, { error: "Invalid JSON body." });
              return;
            }
            const { data: parsed, error } = parseLeaderboard(JSON.stringify(payload.data ?? null));
            if (error || !parsed) {
              sendJson(res, 400, { error: error ?? "Could not parse leaderboard." });
              return;
            }
            const validation = validateDailySteps(parsed);
            if (!validation.ok) {
              sendJson(res, 400, { error: validation.error });
              return;
            }
            const config = resolveBumpConfig(payload.video);
            const job: RenderJob = {
              id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
              state: "bundling",
              progress: 0,
              warnings: validation.warnings,
            };
            jobs.set(job.id, job);
            busy = true;
            void runJob(job, parsed, config);
            sendJson(res, 200, { jobId: job.id, warnings: validation.warnings });
            return;
          }

          if (req.method === "GET" && url.pathname === "/status") {
            const job = jobs.get(url.searchParams.get("id") ?? "");
            if (!job) {
              sendJson(res, 404, { error: "Unknown render job." });
              return;
            }
            sendJson(res, 200, {
              state: job.state,
              progress: job.progress,
              error: job.error,
              fileName: job.fileName,
              warnings: job.warnings,
            });
            return;
          }

          if (req.method === "GET" && url.pathname === "/file") {
            const job = jobs.get(url.searchParams.get("id") ?? "");
            if (!job || job.state !== "done" || !job.outputPath) {
              sendJson(res, 404, { error: "Render not finished." });
              return;
            }
            const stat = fs.statSync(job.outputPath);
            res.statusCode = 200;
            res.setHeader("Content-Type", "video/mp4");
            res.setHeader("Content-Length", stat.size);
            res.setHeader("Content-Disposition", `attachment; filename="${job.fileName}"`);
            fs.createReadStream(job.outputPath).pipe(res);
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

import React, { useState } from "react";
import { useLinksState, type LinksState, type TrackedLink } from "../../hooks/useLinksState";

interface Props {
  state: LinksState;
}

const CHANNELS = ["facebook", "instagram", "reddit", "whatsapp", "email", "x", "linkedin", "other"];
const MEDIUMS = ["dm", "comment", "post", "bio", "story", "reply", "email"];

function relativeTime(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const LinkRow: React.FC<{ link: TrackedLink; state: LinksState }> = ({ link, state }) => {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [destination, setDestination] = useState(link.destination);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <tr className={link.archived_at ? "lk-row lk-row-archived" : "lk-row"}>
      <td>
        <button className="lk-copy" onClick={copy} title={link.url}>
          <span className="lk-code">/l/{link.code}</span>
          <span className="lk-copy-hint">{copied ? "copied" : "copy"}</span>
        </button>
      </td>
      <td className="lk-label">{link.label || <span className="lk-muted">—</span>}</td>
      <td className="lk-tags">
        <span className="lk-tag">{link.channel}</span>
        <span className="lk-tag lk-tag-dim">{link.medium}</span>
        <span className="lk-tag lk-tag-dim">{link.campaign}</span>
      </td>
      <td>
        {editing ? (
          <form
            className="lk-dest-edit"
            onSubmit={(e) => {
              e.preventDefault();
              void state.setDestination(link.code, destination).then(() => setEditing(false));
            }}
          >
            <input value={destination} onChange={(e) => setDestination(e.target.value)} autoFocus />
            <button type="submit" disabled={state.busy}>
              save
            </button>
          </form>
        ) : (
          <button className="lk-dest" onClick={() => setEditing(true)} title="Repoint this link">
            {link.destination}
          </button>
        )}
      </td>
      <td className="lk-num">{link.human_click_count}</td>
      <td className="lk-num lk-muted">{link.unique_visitors}</td>
      <td className="lk-num lk-num-strong">{link.signups}</td>
      <td className="lk-muted lk-when">{relativeTime(link.last_click_at)}</td>
      <td>
        <button
          className="lk-archive"
          disabled={state.busy}
          onClick={() => void state.setArchived(link.code, !link.archived_at)}
        >
          {link.archived_at ? "restore" : "archive"}
        </button>
      </td>
    </tr>
  );
};

export const LinksView: React.FC<Props> = ({ state }) => {
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [medium, setMedium] = useState(MEDIUMS[0]);
  const [campaign, setCampaign] = useState("");
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("/");
  const [created, setCreated] = useState<TrackedLink | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const link = await state.createLink({ channel, medium, campaign, label, destination });
    if (link) {
      setCreated(link);
      setCampaign("");
      setLabel("");
      try {
        await navigator.clipboard.writeText(link.url);
      } catch {
        /* clipboard may be blocked; the URL is still shown below */
      }
    }
  };

  const nonLocalTarget = state.target && !/localhost|127\.0\.0\.1/.test(state.target);

  return (
    <>
      <div className="sidebar-left">
        <div className="sidebar-inner">
          <div className="logo">LINKS</div>
          <div className="logo-sub">SHORT LINK GENERATOR</div>

          <form className="lk-form" onSubmit={submit}>
            <label className="lk-field">
              <span>Channel</span>
              <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="lk-field">
              <span>Method</span>
              <select value={medium} onChange={(e) => setMedium(e.target.value)}>
                {MEDIUMS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            <label className="lk-field">
              <span>Campaign</span>
              <input
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="layl_post"
                required
              />
            </label>

            <label className="lk-field">
              <span>Note</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Layl gym buddy post"
              />
              <small>Private. Never appears in the URL.</small>
            </label>

            <label className="lk-field">
              <span>Destination</span>
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="/" />
            </label>

            <button className="lk-generate" type="submit" disabled={state.busy}>
              {state.busy ? "Generating…" : "Generate link"}
            </button>
          </form>

          {created && (
            <div className="lk-created">
              <div className="lk-created-url">{created.url}</div>
              <div className="lk-created-note">Copied to clipboard — paste it straight into the DM.</div>
            </div>
          )}

          {state.error && (
            <div className="lk-error">
              {state.error}
              <button onClick={state.clearError}>dismiss</button>
            </div>
          )}
        </div>
      </div>

      <div className="center lk-center">
        <div className="lk-head">
          <label className="lk-show-archived">
            <input
              type="checkbox"
              checked={state.showArchived}
              onChange={(e) => state.setShowArchived(e.target.checked)}
            />
            Show archived
          </label>
          <button className="lk-refresh" onClick={() => void state.load()} disabled={state.loading}>
            {state.loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {nonLocalTarget && (
          <div className="lk-warn">
            Connected to <strong>{state.target}</strong> — links generated here are live.
          </div>
        )}

        {state.loading && state.links.length === 0 ? (
          <div className="lk-empty">Loading links…</div>
        ) : state.visibleLinks.length === 0 ? (
          <div className="lk-empty">
            No links yet. Generate one on the left and it will show up here with its click and signup counts.
          </div>
        ) : (
          <table className="lk-table">
            <thead>
              <tr>
                <th>Link</th>
                <th>Note</th>
                <th>Tags</th>
                <th>Destination</th>
                <th className="lk-num">Clicks</th>
                <th className="lk-num">People</th>
                <th className="lk-num">Signups</th>
                <th>Last click</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {state.visibleLinks.map((link) => (
                <LinkRow key={link.id} link={link} state={state} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

/**
 * Owns the hook so the links are only fetched when the tab is actually open — the
 * other sections keep their state in App.tsx, but this one talks to a dev-only
 * endpoint and there is no reason to hit it on every app load.
 */
export const LinksSection: React.FC = () => {
  const state = useLinksState();
  return <LinksView state={state} />;
};

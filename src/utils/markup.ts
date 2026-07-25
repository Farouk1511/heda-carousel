// ---------------------------------------------------------------------------
// Inline markup engine for marketing text elements.
//   **bold**       -> bold + accent color   (matches carousel BoldText)
//   *italic*       -> italic
//   ==highlight==  -> accent background pill
//   ~~strike~~     -> line-through
//   {#ff5500}..{/} -> explicit color
//   {big}..{/}     -> ×1.35 font size
//   {small}..{/}   -> ×0.8 font size
// Nesting is allowed. Unterminated markers render literally (never throw).
// ---------------------------------------------------------------------------

export interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  highlight?: boolean;
  strike?: boolean;
  color?: string; // hex
  sizeMul?: number; // e.g. 1.35
}

export interface MarkupRun {
  text: string;
  style: RunStyle;
}

const SIZE_BIG = 1.35;
const SIZE_SMALL = 0.8;
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

function hasCloser(input: string, from: number, marker: string): boolean {
  return input.indexOf(marker, from) !== -1;
}

export function parseMarkup(input: string): MarkupRun[] {
  const runs: MarkupRun[] = [];
  let buf = "";
  let bold = false;
  let italic = false;
  let highlight = false;
  let strike = false;
  const tagStack: { color?: string; sizeMul?: number }[] = [];

  const currentStyle = (): RunStyle => {
    let color: string | undefined;
    let sizeMul = 1;
    for (const t of tagStack) {
      if (t.color) color = t.color;
      if (t.sizeMul) sizeMul *= t.sizeMul;
    }
    const st: RunStyle = {};
    if (bold) st.bold = true;
    if (italic) st.italic = true;
    if (highlight) st.highlight = true;
    if (strike) st.strike = true;
    if (color) st.color = color;
    if (sizeMul !== 1) st.sizeMul = sizeMul;
    return st;
  };

  const flush = () => {
    if (buf) {
      runs.push({ text: buf, style: currentStyle() });
      buf = "";
    }
  };

  const i = { v: 0 };
  const n = input.length;

  // Handle a two-char symmetric toggle (** == ~~). Returns true when the marker
  // matched at the cursor (always consumes the 2 chars, so a `**` sequence never
  // falls through to the single-`*` italic handler).
  const tryToggle2 = (marker: string, active: boolean, set: (b: boolean) => void): boolean => {
    if (input.slice(i.v, i.v + 2) !== marker) return false;
    if (active) {
      flush();
      set(false);
    } else if (hasCloser(input, i.v + 2, marker)) {
      flush();
      set(true);
    } else {
      buf += marker; // no closer -> render literally
    }
    i.v += 2;
    return true;
  };

  while (i.v < n) {
    if (tryToggle2("**", bold, (b) => (bold = b))) continue;
    if (tryToggle2("==", highlight, (b) => (highlight = b))) continue;
    if (tryToggle2("~~", strike, (b) => (strike = b))) continue;

    const ch = input[i.v];

    if (ch === "*") {
      if (italic) {
        flush();
        italic = false;
        i.v += 1;
        continue;
      }
      if (hasCloser(input, i.v + 1, "*")) {
        flush();
        italic = true;
        i.v += 1;
        continue;
      }
      buf += ch;
      i.v += 1;
      continue;
    }

    if (ch === "{") {
      const closeIdx = input.indexOf("}", i.v);
      if (closeIdx !== -1) {
        const tag = input.slice(i.v + 1, closeIdx);
        if (tag === "/") {
          if (tagStack.length) {
            flush();
            tagStack.pop();
            i.v = closeIdx + 1;
            continue;
          }
        } else {
          const isColor = HEX_RE.test(tag);
          const isSize = tag === "big" || tag === "small";
          if ((isColor || isSize) && hasCloser(input, closeIdx + 1, "{/}")) {
            flush();
            if (isColor) tagStack.push({ color: tag });
            else tagStack.push({ sizeMul: tag === "big" ? SIZE_BIG : SIZE_SMALL });
            i.v = closeIdx + 1;
            continue;
          }
        }
      }
      buf += ch;
      i.v += 1;
      continue;
    }

    buf += ch;
    i.v += 1;
  }

  flush();
  return runs;
}

/** Return the visible text with all markup markers removed. */
export function stripMarkup(input: string): string {
  return parseMarkup(input)
    .map((r) => r.text)
    .join("");
}

export type WrapKind =
  | { type: "symmetric"; marker: string } // ** * == ~~
  | { type: "tag"; open: string }; // {#hex} | {big} | {small}; close is always {/}

export interface WrapResult {
  text: string;
  selStart: number;
  selEnd: number;
}

/**
 * Wrap the selection [start,end) with the given marker, or unwrap it if it is
 * already wrapped. Returns the new text and adjusted selection offsets.
 */
export function toggleWrap(
  text: string,
  start: number,
  end: number,
  kind: WrapKind
): WrapResult {
  const sel = text.slice(start, end);
  const before = text.slice(0, start);
  const after = text.slice(end);

  if (kind.type === "symmetric") {
    const m = kind.marker;
    if (before.endsWith(m) && after.startsWith(m)) {
      const nb = before.slice(0, before.length - m.length);
      const na = after.slice(m.length);
      return { text: nb + sel + na, selStart: nb.length, selEnd: nb.length + sel.length };
    }
    if (sel.startsWith(m) && sel.endsWith(m) && sel.length >= 2 * m.length) {
      const inner = sel.slice(m.length, sel.length - m.length);
      return { text: before + inner + after, selStart: start, selEnd: start + inner.length };
    }
    const wrapped = m + sel + m;
    return {
      text: before + wrapped + after,
      selStart: start + m.length,
      selEnd: start + m.length + sel.length,
    };
  }

  const open = kind.open;
  const close = "{/}";
  if (before.endsWith(open) && after.startsWith(close)) {
    const nb = before.slice(0, before.length - open.length);
    const na = after.slice(close.length);
    return { text: nb + sel + na, selStart: nb.length, selEnd: nb.length + sel.length };
  }
  const wrapped = open + sel + close;
  return {
    text: before + wrapped + after,
    selStart: start + open.length,
    selEnd: start + open.length + sel.length,
  };
}

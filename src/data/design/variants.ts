import type { Slide } from "../posts/types";
import type { SlideVariant } from "./types";

export const VARIANTS: { id: SlideVariant; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "stat", label: "Stat" },
  { id: "quote", label: "Quote" },
  { id: "list", label: "List" },
  { id: "comparison", label: "Compare" },
];

export interface StatParts {
  figure: string;
  rest: string;
}

/**
 * Pull a leading figure ("80%", "$1,200", "3x", "9 in 10") off the headline.
 * Works on the **-cleaned headline; returns null when there is no clear figure.
 */
export function parseStat(headline: string): StatParts | null {
  const clean = headline.replace(/\*\*/g, "").trim();
  const match = clean.match(
    /^([~$€£#]?\d[\d,.]*\s*(?:%|x|X|\+)?|\d+\s+(?:in|of|out of)\s+\d+)\s*/
  );
  if (!match) return null;
  const figure = match[1].trim();
  const rest = clean.slice(match[0].length).trim();
  if (!rest) return null;
  return { figure, rest };
}

/** Split the sub into list items on newlines or bullet markers. Needs >= 2 items. */
export function parseList(sub: string): string[] | null {
  let items = sub
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (items.length < 2) {
    items = sub
      .split(/(?:^|\s)[•·▪‣]\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (items.length < 2) return null;
  return items.map((item) => item.replace(/^[-•·▪‣]\s*/, ""));
}

export interface ComparisonParts {
  myth: string;
  truth: string;
}

/** Split the sub into exactly two halves (newline, pipe, or "vs"). */
export function parseComparison(sub: string): ComparisonParts | null {
  for (const splitter of [/\n+/, /\s*\|\s*/, /\s+vs\.?\s+/i]) {
    const parts = sub
      .split(splitter)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 2) {
      return { myth: parts[0], truth: parts[1] };
    }
  }
  return null;
}

/**
 * Cheap heuristic used only to show a hint chip in the editor.
 * Never auto-applied to a slide.
 */
export function suggestVariant(slide: Slide): SlideVariant | null {
  const clean = slide.headline.replace(/\*\*/g, "").trim();
  if (parseStat(slide.headline)) return "stat";
  if (/^["“”'].*["“”']$/.test(clean)) return "quote";
  if (parseList(slide.sub)) return "list";
  return null;
}

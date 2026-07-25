import React from "react";
import { parseMarkup } from "../utils/markup";

export interface RichTextTokens {
  accent: string; // **bold** color
  highlightBg: string; // ==highlight== background
  highlightText: string; // ==highlight== text color
}

interface RichTextProps {
  text: string;
  tokens: RichTextTokens;
}

/** Renders a markup string as styled spans. Font-size multipliers use `em` so
 *  the parent's scaled fontSize flows through untouched. */
export const RichText: React.FC<RichTextProps> = ({ text, tokens }) => {
  const runs = parseMarkup(text);
  return (
    <>
      {runs.map((run, idx) => {
        const s = run.style;
        const style: React.CSSProperties = {};
        if (s.bold) {
          style.fontWeight = 700;
          style.color = tokens.accent;
        }
        if (s.italic) style.fontStyle = "italic";
        if (s.strike) style.textDecoration = "line-through";
        if (s.color) style.color = s.color;
        if (s.sizeMul) style.fontSize = `${s.sizeMul}em`;
        if (s.highlight) {
          style.background = tokens.highlightBg;
          style.color = style.color ?? tokens.highlightText;
          style.padding = "0.08em 0.25em";
          style.borderRadius = "0.15em";
          style.boxDecorationBreak = "clone";
          style.WebkitBoxDecorationBreak = "clone";
        }
        return (
          <span key={idx} style={style}>
            {run.text}
          </span>
        );
      })}
    </>
  );
};

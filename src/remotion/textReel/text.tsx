import React from "react";

const normalizeWord = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9']/g, "");

export const splitBalancedLines = (
  text: string,
  maxCharsPerLine = 25,
  maxLines = 4
): string[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2) {
    return [text];
  }

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  while (lines.length > maxLines) {
    const secondLast = lines[lines.length - 2];
    const last = lines[lines.length - 1];
    lines.splice(lines.length - 2, 2, `${secondLast} ${last}`);
  }

  if (lines.length >= 2) {
    const last = lines[lines.length - 1];
    const prev = lines[lines.length - 2];
    if (last.length < Math.max(8, maxCharsPerLine * 0.35) && prev.split(" ").length > 2) {
      const prevWords = prev.split(" ");
      const moved = prevWords.pop();
      if (moved) {
        lines[lines.length - 2] = prevWords.join(" ");
        lines[lines.length - 1] = `${moved} ${last}`;
      }
    }
  }

  return lines;
};

export const highlightLine = (
  line: string,
  emphasisWords: string[],
  accent: string
): React.ReactNode[] => {
  const emphasisSet = new Set(emphasisWords.map(normalizeWord));
  const parts = line.split(/(\s+)/);
  return parts.map((part, index) => {
    if (!part.trim()) {
      return <React.Fragment key={`sp-${index}`}>{part}</React.Fragment>;
    }
    const isEmphasis = emphasisSet.has(normalizeWord(part));
    return (
      <span
        key={`w-${index}`}
        style={
          isEmphasis
            ? {
                color: accent,
                display: "inline-block",
                transform: "scale(1.03)",
                textShadow: `0 0 24px ${accent}55, 0 0 48px ${accent}22`,
                fontWeight: 700,
              }
            : undefined
        }
      >
        {part}
      </span>
    );
  });
};

export const revealWords = (text: string, visibleWords: number): string => {
  const words = text.trim().split(/\s+/);
  return words.slice(0, Math.max(0, visibleWords)).join(" ");
};

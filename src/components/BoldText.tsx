import React from "react";

interface BoldTextProps {
  text: string;
  hlColor?: string;
}

export const BoldText: React.FC<BoldTextProps> = ({ text, hlColor }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} style={{ color: hlColor, fontWeight: 700 }}>
              {part.slice(2, -2)}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

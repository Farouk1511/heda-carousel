import React, { useState } from "react";
import { toggleWrap, type WrapKind } from "../../utils/markup";

interface MarkupToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (text: string) => void;
  palette: string[];
}

export const MarkupToolbar: React.FC<MarkupToolbarProps> = ({
  textareaRef,
  onChange,
  palette,
}) => {
  const [colorOpen, setColorOpen] = useState(false);
  const [hex, setHex] = useState("#705bcf");

  const apply = (kind: WrapKind) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const res = toggleWrap(ta.value, start, end, kind);
    onChange(res.text);
    requestAnimationFrame(() => {
      const t = textareaRef.current;
      if (t) {
        t.focus();
        t.setSelectionRange(res.selStart, res.selEnd);
      }
    });
  };

  const applyColor = (color: string) => {
    apply({ type: "tag", open: `{${color}}` });
    setColorOpen(false);
  };

  return (
    <div className="mk-toolbar">
      <div className="mk-toolbar-row">
        <button className="mk-tbtn" title="Bold + accent" onClick={() => apply({ type: "symmetric", marker: "**" })}>
          <b>B</b>
        </button>
        <button className="mk-tbtn" title="Italic" onClick={() => apply({ type: "symmetric", marker: "*" })}>
          <i>I</i>
        </button>
        <button className="mk-tbtn" title="Highlight" onClick={() => apply({ type: "symmetric", marker: "==" })}>
          <span className="mk-tbtn-hl">H</span>
        </button>
        <button className="mk-tbtn" title="Strikethrough" onClick={() => apply({ type: "symmetric", marker: "~~" })}>
          <s>S</s>
        </button>
        <button className="mk-tbtn" title="Bigger" onClick={() => apply({ type: "tag", open: "{big}" })}>
          A+
        </button>
        <button className="mk-tbtn" title="Smaller" onClick={() => apply({ type: "tag", open: "{small}" })}>
          A−
        </button>
        <button
          className={`mk-tbtn${colorOpen ? " active" : ""}`}
          title="Color"
          onClick={() => setColorOpen((o) => !o)}
        >
          <span className="mk-tbtn-color" style={{ background: hex }} />
        </button>
      </div>
      {colorOpen && (
        <div className="mk-toolbar-color">
          {palette.map((c) => (
            <button
              key={c}
              className="mk-swatch"
              style={{ background: c }}
              title={c}
              onClick={() => applyColor(c)}
            />
          ))}
          <input
            className="mk-hex"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            spellCheck={false}
          />
          <button className="mk-tbtn" onClick={() => applyColor(hex)}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

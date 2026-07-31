import React, { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  onFiles: (files: FileList | File[]) => void;
  children: React.ReactNode;
}

/**
 * Wraps the stage and accepts dropped files anywhere inside it. dragenter and
 * dragleave fire for every child element the cursor crosses, so the overlay is
 * driven by a depth counter rather than a boolean — otherwise it flickers off
 * the moment the pointer moves over the phone.
 */
export const DropZone: React.FC<DropZoneProps> = ({ onFiles, children }) => {
  const [active, setActive] = useState(false);
  const depth = useRef(0);

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!Array.from(e.dataTransfer.types).includes("Files")) return;
    depth.current += 1;
    setActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      depth.current = 0;
      setActive(false);
      if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  return (
    <div
      className={`mo-dropzone${active ? " active" : ""}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
      {active && (
        <div className="mo-drop-overlay">
          <div className="mo-drop-overlay-inner">
            <span className="mo-drop-icon">↓</span>
            Drop images or a video
          </div>
        </div>
      )}
    </div>
  );
};

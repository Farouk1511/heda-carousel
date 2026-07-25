import React, { useState } from "react";
import type { useCarouselState } from "../hooks/useCarouselState";
import { Sidebar } from "./Sidebar";
import { Preview } from "./Preview";
import { EditPanel } from "./EditPanel";
import { BulkExportModal } from "./BulkExportModal";

interface CarouselViewProps {
  state: ReturnType<typeof useCarouselState>;
}

export const CarouselView: React.FC<CarouselViewProps> = ({ state }) => {
  const [bulkExportOpen, setBulkExportOpen] = useState(false);

  return (
    <>
      <Sidebar
        posts={state.posts}
        selectedPost={state.selectedPost}
        collapsed={state.sidebarCollapsed}
        onSelect={state.selectPost}
      />
      <Preview
        post={state.post}
        currentSlide={state.currentSlide}
        theme={state.theme}
        sidebarCollapsed={state.sidebarCollapsed}
        onPrev={state.prevSlide}
        onNext={state.nextSlide}
        onGoSlide={state.goSlide}
        onToggleSidebar={state.toggleSidebar}
        selectedPostIndex={state.selectedPost}
        exportRatio={state.exportRatio}
        logoScale={state.logoScale}
        postStyle={state.postStyle}
        safeArea={state.safeArea}
        onPatchMockup={state.patchMockup}
        onPatchTextTransform={state.patchTextTransform}
      />
      <EditPanel
        post={state.post}
        currentSlide={state.currentSlide}
        theme={state.theme}
        editingSlide={state.editingSlide}
        exportRatio={state.exportRatio}
        logoScale={state.logoScale}
        onSetTheme={state.setTheme}
        onToggleEdit={state.toggleEdit}
        onUpdateField={state.updateField}
        onUpdateMockup={state.updateMockup}
        onPatchMockup={state.patchMockup}
        onSetMockupLayout={state.setMockupLayout}
        onPatchTextTransform={state.patchTextTransform}
        onRemoveMockup={state.removeMockup}
        onSetExportRatio={state.setExportRatio}
        onSetLogoScale={state.setLogoScale}
        onSetCurrentSlide={state.setCurrentSlide}
        postIndex={state.selectedPost}
        onOpenBulkExport={() => setBulkExportOpen(true)}
        postStyle={state.postStyle}
        onPatchPostStyle={(patch) => state.patchPostStyle(state.post.id, patch)}
        onPatchSlideStyle={(slideIdx, patch) =>
          state.patchSlideStyle(state.post.id, slideIdx, patch)
        }
        safeArea={state.safeArea}
        onToggleSafeArea={state.toggleSafeArea}
      />
      {bulkExportOpen && (
        <BulkExportModal
          posts={state.posts}
          theme={state.theme}
          styles={state.styles}
          logoScale={state.logoScale}
          onClose={() => setBulkExportOpen(false)}
        />
      )}
    </>
  );
};

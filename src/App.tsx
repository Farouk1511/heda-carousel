import { useState } from "react";
import { useCarouselState } from "./hooks/useCarouselState";
import { Sidebar } from "./components/Sidebar";
import { Preview } from "./components/Preview";
import { EditPanel } from "./components/EditPanel";
import { BulkExportModal } from "./components/BulkExportModal";
import "./App.css";

function App() {
  const state = useCarouselState();
  const [bulkExportOpen, setBulkExportOpen] = useState(false);

  return (
    <div className="app">
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
      />
      <EditPanel
        post={state.post}
        currentSlide={state.currentSlide}
        theme={state.theme}
        editingSlide={state.editingSlide}
        exportRatio={state.exportRatio}
        onSetTheme={state.setTheme}
        onToggleEdit={state.toggleEdit}
        onUpdateField={state.updateField}
        onSetExportRatio={state.setExportRatio}
        onSetCurrentSlide={state.setCurrentSlide}
        postIndex={state.selectedPost}
        onOpenBulkExport={() => setBulkExportOpen(true)}
      />
      {bulkExportOpen && (
        <BulkExportModal
          posts={state.posts}
          theme={state.theme}
          onClose={() => setBulkExportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

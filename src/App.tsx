import { useState } from "react";
import { useCarouselState } from "./hooks/useCarouselState";
import { Sidebar } from "./components/Sidebar";
import { Preview } from "./components/Preview";
import { EditPanel } from "./components/EditPanel";
import { BulkExportModal } from "./components/BulkExportModal";
import { LeaderboardView } from "./components/LeaderboardView";
import "./App.css";

type AppMode = "carousel" | "leaderboard";

function App() {
  const state = useCarouselState();
  const [bulkExportOpen, setBulkExportOpen] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>("carousel");

  const modeSwitch = (
    <div className="mode-switch">
      <button
        className={`mode-switch-btn${appMode === "carousel" ? " active" : ""}`}
        onClick={() => setAppMode("carousel")}
      >
        Carousel
      </button>
      <button
        className={`mode-switch-btn${appMode === "leaderboard" ? " active" : ""}`}
        onClick={() => setAppMode("leaderboard")}
      >
        Leaderboard
      </button>
    </div>
  );

  if (appMode === "leaderboard") {
    return (
      <div className="app">
        {modeSwitch}
        <LeaderboardView />
      </div>
    );
  }

  return (
    <div className="app">
      {modeSwitch}
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
      />
      {bulkExportOpen && (
        <BulkExportModal
          posts={state.posts}
          theme={state.theme}
          logoScale={state.logoScale}
          onClose={() => setBulkExportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;

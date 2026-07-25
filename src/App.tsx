import { useEffect, useState } from "react";
import { useCarouselState } from "./hooks/useCarouselState";
import { useMarketingState } from "./hooks/useMarketingState";
import { AppNav, type AppSection } from "./components/AppNav";
import { CarouselView } from "./components/CarouselView";
import { LeaderboardView } from "./components/LeaderboardView";
import { MarketingView } from "./components/marketing/MarketingView";
import "./App.css";

const SECTION_KEY = "heda.app.section";

function loadSection(): AppSection {
  const saved = localStorage.getItem(SECTION_KEY);
  if (saved === "carousel" || saved === "leaderboard" || saved === "marketing") {
    return saved;
  }
  return "carousel";
}

function App() {
  const carousel = useCarouselState();
  const marketing = useMarketingState();
  const [section, setSection] = useState<AppSection>(loadSection);

  useEffect(() => {
    localStorage.setItem(SECTION_KEY, section);
  }, [section]);

  return (
    <div className="app">
      <AppNav section={section} onChange={setSection} />
      {section === "carousel" && <CarouselView state={carousel} />}
      {section === "leaderboard" && <LeaderboardView />}
      {section === "marketing" && <MarketingView state={marketing} />}
    </div>
  );
}

export default App;

export interface LeaderboardEntry {
  rank: number;
  name: string;
  steps: number;
  imageUrl?: string;
  /**
   * Per-day (non-cumulative) step counts, index 0 = week.start. Optional for
   * the image cards; required for the bump-chart video, which derives daily
   * ranks from these instead of the weekly `steps` total.
   */
  dailySteps?: number[];
}

export interface LeaderboardWeek {
  start: string;
  end: string;
  label: string;
}

export interface LeaderboardWinner {
  name: string;
  steps: number;
}

export interface LeaderboardData {
  week: LeaderboardWeek;
  leaderboard: LeaderboardEntry[];
  winner: LeaderboardWinner;
}

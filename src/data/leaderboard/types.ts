export interface LeaderboardEntry {
  rank: number;
  name: string;
  steps: number;
  imageUrl?: string;
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

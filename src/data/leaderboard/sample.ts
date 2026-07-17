import type { LeaderboardData } from "./types";

const PHOTO = "https://gjuexacvsbgmwuobtvdc.supabase.co/storage/v1/object/public/profile-photos";

/**
 * Sample week. The dailySteps are hand-tuned so each sums exactly to the
 * weekly total AND the bump-chart video has a story to tell: Tola leads days
 * 1-2 before Olise takes over, Braye grinds up from 4th, Final Boss starts
 * 3rd and fades to 8th, Peter climbs 7th -> 4th (biggest climber), the
 * mid-pack (Peter/Chinedu/wanheda) trade places repeatedly with an exact
 * cumulative tie on day 4 (Peter/Chinedu) and day 5 (Ewaen/Xz). Xz has no
 * imageUrl so the initials fallback stays exercised.
 */
export const SAMPLE_LEADERBOARD: LeaderboardData = {
  week: {
    start: "2026-06-22",
    end: "2026-06-28",
    label: "June 22–28, 2026",
  },
  leaderboard: [
    { rank: 1, name: "Olise Ogbum", steps: 153140, imageUrl: `${PHOTO}/5d7b4d3d-d10f-4ef5-ba4d-15e3dc6d2359/1781216453792-x1h7ngcj.jpg`, dailySteps: [18500, 19200, 25400, 24800, 23400, 21200, 20640] },
    { rank: 2, name: "Braye", steps: 134976, imageUrl: `${PHOTO}/7175b0c3-4e50-42c4-9c99-d220140b6f3b/1779740514721-p1b4yovu.jpg`, dailySteps: [15800, 17200, 19100, 20800, 21076, 20500, 20500] },
    { rank: 3, name: "Tola Fadahunsi", steps: 110764, imageUrl: `${PHOTO}/fd820174-bdaf-4a19-bcbe-ea0928840afd/1781231369975-f5n9x04m.jpg`, dailySteps: [24500, 22800, 15200, 13000, 12400, 11800, 11064] },
    { rank: 4, name: "Peter", steps: 93670, imageUrl: `${PHOTO}/7ed562df-4e1c-4747-b11d-571b5e7e118f/1782344580875-6q9dx32p.jpg`, dailySteps: [13400, 13000, 13600, 13500, 13800, 13200, 13170] },
    { rank: 5, name: "Chinedu", steps: 92563, imageUrl: `${PHOTO}/dc29816f-1cfd-453b-88ff-f26c7e325c08/1782348607616-6mhjsii2.jpg`, dailySteps: [14200, 13100, 12800, 13400, 13500, 13000, 12563] },
    { rank: 6, name: "wanheda", steps: 90461, imageUrl: `${PHOTO}/7145e873-d1da-4f7e-bb0e-1281a2161aee/1779679930428-a9khlmsa.jpg`, dailySteps: [15000, 13500, 10800, 12500, 16000, 11500, 11161] },
    { rank: 7, name: "Hauwa Umar", steps: 72829, imageUrl: `${PHOTO}/fcf14643-b270-43b3-9ed0-871ea6b1dc1a/1781421135889-fqs2d8wg.jpg`, dailySteps: [10200, 10400, 10600, 10329, 10500, 10400, 10400] },
    { rank: 8, name: "Final Boss", steps: 66440, imageUrl: `${PHOTO}/3ed4806a-6d08-4366-94e1-7a0766a5ba6b/1779725910402-rcz6tux9.jpg`, dailySteps: [16800, 12500, 9200, 7800, 7000, 6640, 6500] },
    { rank: 9, name: "Ewaen", steps: 54388, imageUrl: `${PHOTO}/eabdaa55-1dc4-4545-aa6c-c1c0a1f35987/1780277241382-h9w6o7g7.jpg`, dailySteps: [7600, 7800, 8100, 7700, 7900, 7688, 7600] },
    { rank: 10, name: "Xz", steps: 52354, dailySteps: [8400, 8200, 7800, 7500, 7200, 6800, 6454] },
  ],
  winner: {
    name: "Olise Ogbum",
    steps: 153140,
  },
};

export const SAMPLE_LEADERBOARD_JSON = JSON.stringify(SAMPLE_LEADERBOARD, null, 2);

export const DEFAULT_LEADERBOARD_CTA = "Join the challenge ↓";

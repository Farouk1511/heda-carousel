import type { LeaderboardData } from "./types";

const PHOTO = "https://gjuexacvsbgmwuobtvdc.supabase.co/storage/v1/object/public/profile-photos";

export const SAMPLE_LEADERBOARD: LeaderboardData = {
  week: {
    start: "2026-06-22",
    end: "2026-06-28",
    label: "June 22–28, 2026",
  },
  leaderboard: [
    { rank: 1, name: "Olise Ogbum", steps: 153140, imageUrl: `${PHOTO}/5d7b4d3d-d10f-4ef5-ba4d-15e3dc6d2359/1781216453792-x1h7ngcj.jpg` },
    { rank: 2, name: "Braye", steps: 134976, imageUrl: `${PHOTO}/7175b0c3-4e50-42c4-9c99-d220140b6f3b/1779740514721-p1b4yovu.jpg` },
    { rank: 3, name: "Tola Fadahunsi", steps: 110764, imageUrl: `${PHOTO}/fd820174-bdaf-4a19-bcbe-ea0928840afd/1781231369975-f5n9x04m.jpg` },
    { rank: 4, name: "Peter", steps: 93670, imageUrl: `${PHOTO}/7ed562df-4e1c-4747-b11d-571b5e7e118f/1782344580875-6q9dx32p.jpg` },
    { rank: 5, name: "Chinedu", steps: 92563, imageUrl: `${PHOTO}/dc29816f-1cfd-453b-88ff-f26c7e325c08/1782348607616-6mhjsii2.jpg` },
    { rank: 6, name: "wanheda", steps: 90461, imageUrl: `${PHOTO}/7145e873-d1da-4f7e-bb0e-1281a2161aee/1779679930428-a9khlmsa.jpg` },
    { rank: 7, name: "Hauwa Umar", steps: 72829, imageUrl: `${PHOTO}/fcf14643-b270-43b3-9ed0-871ea6b1dc1a/1781421135889-fqs2d8wg.jpg` },
    { rank: 8, name: "Final Boss", steps: 66440, imageUrl: `${PHOTO}/3ed4806a-6d08-4366-94e1-7a0766a5ba6b/1779725910402-rcz6tux9.jpg` },
    { rank: 9, name: "Ewaen", steps: 54388, imageUrl: `${PHOTO}/eabdaa55-1dc4-4545-aa6c-c1c0a1f35987/1780277241382-h9w6o7g7.jpg` },
    { rank: 10, name: "Xz", steps: 52354, imageUrl: `${PHOTO}/8ba69aec-2796-4549-bb9d-b87070937cef/1779762142764-n8a32whp.jpg` },
  ],
  winner: {
    name: "Olise Ogbum",
    steps: 153140,
  },
};

export const SAMPLE_LEADERBOARD_JSON = JSON.stringify(SAMPLE_LEADERBOARD, null, 2);

export const DEFAULT_LEADERBOARD_CTA = "Join the challenge ↓";

import type { MonthDraft } from "../types";

// Standalone drops that are not tied to the 90-day calendar. Days are
// month-relative here and only act as ordering labels, so slot new drops in
// at the next free number and publish whenever the moment lands.
//
// image: "mascot" marks a MASCOT SLOT — the team drops the mascot art in
// before publishing, same way "photo" and "mockup" get sourced.
//
// 1,000,000 steps math (~0.762m average step length):
//   762,000 m            = 762 km = 473 miles
//   762 km / 42.195 km   = ~18 marathons
//   1,000,000 / ~5,000   = ~200 days at an average person's daily step count
//   time on feet is the soft number — 125 h assumes a brisk ~133 steps/min,
//   so the copy says "over 125 hours" to stay true at slower cadences.

export const specialDrops: MonthDraft = {
  title: "Special Drops",
  weeks: [
    {
      title: "Milestones",
      posts: [
        {
          day: 1,
          title: "Someone just hit 1,000,000 steps",
          tags: ["5 SLIDES", "MILESTONE", "NEWS", "HIGH SHARE"],
          slides: [
            {
              type: "The news",
              headline: "Someone on Heda just crossed **1,000,000 steps.**",
              sub: "Yeah. One million. We had to make a post about it.",
              image: "mockup",
              imageDesc:
                "Heda profile or streak screen showing the 1,000,000 steps milestone lit up — big number, celebratory state, confetti or a milestone badge. The hero moment. Portrait phone frame, purple accent glow.",
            },
            {
              type: "The person",
              headline: "Meet **Braye.** The first to hit the million.",
              sub: "While the rest of us were 'starting Monday,' Braye just quietly kept walking. And walking. And walking.",
              image: "photo",
              imageDesc:
                "Photo of Braye (get his permission before publishing) — mid-walk, at the gym, or a proud portrait. If he would rather stay faceless, use his Heda avatar on a celebratory card. Warm, hero-of-the-week energy.",
            },
            {
              type: "Put it in perspective",
              headline: "1,000,000 steps is **762 km.**",
              sub: "That is 473 miles. On foot. Far enough to walk clean across a country and keep going.",
              image: "mascot",
              imageDesc:
                "MASCOT SLOT — mascot walking across a stylized map with a long dotted trail stretching hundreds of km behind it. Shows the sheer distance. Team drops in mascot.",
            },
            {
              type: "How crazy is that",
              headline: "To actually grasp it:",
              sub: "That is 18 marathons back to back. Over 125 hours of walking. What the average person takes 200 days to do — and Braye did it faster.",
              image: "mascot",
              imageDesc:
                "MASCOT SLOT — mascot surrounded by fun equivalence icons: 18 tiny marathon medals, a clock showing 125 hrs, a '200 days' calendar. Playful infographic vibe. Team drops in mascot + icons.",
            },
            {
              type: "Your turn",
              headline: "Every giant number started at step one.",
              sub: "Braye was not chasing a number. He was chasing the guy above him on the leaderboard — and staying ahead of the one below. Your million starts the day you get on it.",
              cta: "↓ Join the waitlist",
            },
          ],
        },
      ],
    },
  ],
};

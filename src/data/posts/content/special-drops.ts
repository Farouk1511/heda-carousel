import type { MonthDraft } from "../types";

/** Caption paragraphs, blank line between each — how Instagram renders them. */
const para = (...paragraphs: string[]) => paragraphs.join("\n\n");

// Standalone drops that are not tied to the 90-day calendar. Days are
// month-relative here and only act as ordering labels, so slot new drops in
// at the next free number and publish whenever the moment lands.
//
// image: "mascot" marks a MASCOT SLOT — the team drops the mascot art in
// before publishing, same way "photo" and "mockup" get sourced.
//
// "Launch Week" (days 2–6) is the Jul 27–31 2026 launch countdown:
// Mon problem → Tue why → Wed founder story → Thu reveal+tomorrow → Fri live.
// Story frames, captions, image prompts, and checklists live in
// marketing/launch-campaign.md. Day numbers here are ordering labels only.
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
          caption: para(
            "Nobody was watching when he did it. That's the part that gets us.",
            "762 km. Eighteen marathons back to back. Over 125 hours on his feet. Braye didn't announce a single one of those days — he just kept walking while the rest of us were \"starting Monday.\"",
            "He wasn't chasing the number either. He was chasing the guy above him on the leaderboard, and staying ahead of the one below.",
            "What's the longest you've kept something going without anyone noticing?"
          ),
          hashtags: "#accountability #stepgoal #fitfam #ottawagym #heda",
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
    {
      title: "Launch Week",
      posts: [
        {
          day: 2,
          title: "The empty spot (Mon — the problem)",
          tags: ["5 SLIDES", "LAUNCH T-4", "RELATABLE", "NO BRAND"],
          // No #heda here — day one keeps the product out of it.
          caption: para(
            "The bag has been packed by the door since Monday. It's Thursday.",
            "You didn't skip because you're lazy. You skipped because nothing happens when you do. No text. No \"where were you?\". Just a membership you keep paying for.",
            "Be honest — how many times has your gym partner cancelled on you this month?",
            "Friday. 31.07."
          ),
          hashtags: "#gympartner #gymmotivation #accountability #ottawagym",
          slides: [
            {
              type: "Hook",
              headline: "Your gym partner said **'be there in 10.'**",
              sub: "That was three hours ago.",
              image: "photo",
              imageDesc:
                "Dark cinematic gym, one person sitting on a bench checking their phone, empty bench beside them. No logos, no UI. Full prompt in marketing/launch-campaign.md → Day 1.",
            },
            {
              type: "The pattern",
              headline: "You said **Monday**.",
              sub: "It's Thursday. The bag is still packed by the door.",
            },
            {
              type: "The truth",
              headline: "The plan was never the problem.",
              sub: "Going alone was. Everything is heavier when nobody's expecting you.",
            },
            {
              type: "The quiet quit",
              headline: "Nobody notices the day you **stop**.",
              sub: "No text. No 'where were you?' Just a membership you keep paying for.",
              image: "photo",
              imageDesc:
                "Empty squat rack under a single cold spotlight, rest of the gym falls to black. Loneliness as a location. Full prompt in launch-campaign.md → Day 1.",
            },
            {
              type: "The tease",
              headline: "Friday. **31.07.**",
              sub: "Something's coming for the empty spot next to you.",
              // Deliberately no cta — this slide stays mysterious, no CTA styling.
            },
          ],
        },
        {
          day: 3,
          title: "It was never about discipline (Tue — why)",
          tags: ["5 SLIDES", "LAUNCH T-3", "INSIGHT", "SOFT INTRO"],
          caption: para(
            "Discipline is the most overrated word in fitness.",
            "The people you know who never miss a session aren't more disciplined than you. They just have someone who notices. A training partner, a rival, a group chat that asks where they were. That's the whole difference.",
            "We've been building something for everyone who doesn't have that yet. It's called Heda.",
            "Tag the person who notices when you don't show up. If nobody came to mind, that's the point.",
            "Friday. Waitlist in bio — they get in first."
          ),
          slides: [
            {
              type: "Hook",
              headline: "Nobody quits the gym because it's **too hard**.",
              sub: "The weights were never the problem.",
            },
            {
              type: "The real reason",
              headline: "You quit because nobody **noticed** you came.",
              sub: "Or noticed when you stopped. Silence is the easiest thing to disappear into.",
            },
            {
              type: "The proof",
              headline: "Motivation starts it. **Accountability** finishes it.",
              sub: "Ask anyone consistent. There's always someone they don't want to let down.",
              image: "photo",
              imageDesc:
                "Split scene — left: person training alone in near-dark; right: two people spotting a bench press, warmer light. Same gym, different worlds. Full prompt in launch-campaign.md → Day 2.",
            },
            {
              type: "Soft intro",
              headline: "So we built something for this.",
              sub: "It's called Heda. More on that soon.",
            },
            {
              type: "The tease",
              headline: "Friday, it gets easier to show up.",
              sub: "The waitlist gets in first.",
              cta: "↓ Join the waitlist",
            },
          ],
        },
        {
          day: 4,
          title: "Why we built Heda (Wed — founder story)",
          tags: ["5 SLIDES", "LAUNCH T-2", "FOUNDER STORY", "HUMAN"],
          caption: para(
            "\"Tomorrow for sure.\" We heard it so often we could set a watch to it.",
            "Then we became the ones saying it. That's the honest version. We didn't stop going because we ran out of motivation — we stopped because there was nobody on the other end of it. Two people having a bad week with no reason to show up anyway.",
            "We never set out to build an app. We wanted someone already at the gym wondering where we were. Nothing did that, so we made it.",
            "What's the flakiest text you've ever got from a gym partner? We'll go first, ours is up there in slide two.",
            "Two days. 31.07. Waitlist in bio."
          ),
          hashtags: "#gympartner #accountability #buildinpublic #ottawagym #heda",
          slides: [
            {
              type: "Hook",
              headline: "We built Heda because our gym partners kept **cancelling**.",
              sub: "This one's personal.",
            },
            {
              type: "The story",
              headline: "'Can't make it today. **Tomorrow for sure.**'",
              sub: "We heard it so often we could set a watch to it. Then we became the ones saying it.",
              image: "photo",
              imageDesc:
                "Phone on a gym bench showing a cancelled-plans text thread (no app UI), gym bag beside it. Moody, shallow depth. Full prompt in launch-campaign.md → Day 3.",
            },
            {
              type: "The wish",
              headline: "We didn't want an app. We wanted someone to **show up**.",
              sub: "Someone already at the gym, wondering where we were.",
            },
            {
              type: "The decision",
              headline: "So we stopped waiting and built the thing.",
              sub: "Not a dating app. Not another feed. A way to find people who actually show up.",
              image: "photo",
              imageDesc:
                "Late-night build scene — laptop with design files/wireframes, coffee, gym bag in frame. Founder energy, no faces needed. Full prompt in launch-campaign.md → Day 3.",
            },
            {
              type: "The countdown",
              headline: "Two days. **31.07.**",
              sub: "Built by people who kept getting cancelled on.",
              cta: "↓ Join the waitlist",
            },
          ],
        },
        {
          day: 5,
          title: "This is Heda (Thu — reveal + tomorrow)",
          tags: ["5 SLIDES", "LAUNCH T-1", "REVEAL", "MOCKUPS"],
          // TODO: 9AM matches the placeholder on slide 4 — change both together.
          caption: para(
            "Three days of posting in riddles. Here's the actual thing.",
            "Heda finds you a gym partner who trains where you train, when you train, chasing something close to what you're chasing. Not photos first — your PRs, your training style, your usual time. Then it makes turning up visible: streaks and a leaderboard, so skipping costs you something.",
            "That's the app. It isn't a dating app and it isn't going to become one.",
            "Tomorrow, 9AM. Link in bio.",
            "Who are you sending this to?"
          ),
          hashtags: "#gympartner #workoutpartner #accountability #ottawagym #heda",
          slides: [
            {
              type: "The reveal",
              headline: "This is **Heda**.",
              sub: "Find a gym partner who actually shows up.",
              image: "mockup",
              imageDesc:
                "Hero shot — phone with the Heda home/match screen, dark premium lighting, purple accent glow. First time the UI is fully visible. Full prompt in launch-campaign.md → Day 4.",
            },
            {
              type: "Matching",
              headline: "Match on **goals**, gym, and schedule.",
              sub: "Not looks. Not follower counts. Whether you'll both be there at 6am.",
              image: "mockup",
              imageDesc:
                "Matching/swipe screen mockup — fitness-first profile card: PRs, training style, home gym. Portrait device frame.",
            },
            {
              type: "Accountability",
              headline: "Your consistency, **visible**.",
              sub: "Streaks and leaderboards that make skipping feel different.",
              image: "mockup",
              imageDesc:
                "Leaderboard/streak screen mockup — names climbing, a streak flame, one rival right behind you. Portrait device frame.",
            },
            {
              type: "Tomorrow",
              // TODO: confirm launch hour before publishing (9AM placeholder).
              headline: "**Tomorrow.** 31.07.",
              sub: "9AM. Set an alarm. Tell your gym partner — if they show up, keep them.",
            },
            {
              type: "Last call",
              headline: "The empty spot gets filled tomorrow.",
              sub: "First access goes to the waitlist.",
              cta: "↓ Link in bio",
            },
          ],
        },
        {
          day: 6,
          title: "Heda is here (Fri — launch day)",
          tags: ["5 SLIDES", "LAUNCH DAY", "DIRECT", "SHAREABLE"],
          caption: para(
            "Five days ago we posted a picture of an empty bench. Today it gets filled.",
            "Heda is live. Find a gym partner at your gym, on your schedule, who actually turns up — then keep each other honest with streaks and a leaderboard that makes skipping feel like something.",
            "Free on the App Store. Link in bio.",
            "Send this to the one who said Monday. They know who they are."
          ),
          slides: [
            {
              type: "It's live",
              headline: "Heda is **here**.",
              sub: "Live now. For real. Go.",
              image: "mockup",
              imageDesc:
                "Launch hero — phone held mid-air in a dark gym, Heda open, purple glow lighting the scene. Celebration without confetti. Full prompt in launch-campaign.md → Launch Day.",
            },
            {
              type: "What it is",
              headline: "A gym partner who **shows up**.",
              sub: "Match with people at your gym, on your schedule, chasing the same thing.",
              image: "mockup",
              imageDesc: "Clean matching-screen mockup, minimal framing, lots of dark space around the device.",
            },
            {
              type: "Why it exists",
              headline: "Not a dating app. Not another feed.",
              sub: "The reason you stop training alone.",
            },
            {
              type: "Download",
              headline: "Free. **Today.**",
              sub: "Download Heda on the App Store — link in bio.",
              image: "mockup",
              imageDesc:
                "App Store product-page style shot or device with download screen. Keep it simple — the CTA is the star.",
            },
            {
              type: "Bring someone",
              headline: "Don't come alone.",
              sub: "Send this to the friend who said Monday.",
              cta: "↓ Link in bio",
            },
          ],
        },
      ],
    },
  ],
};

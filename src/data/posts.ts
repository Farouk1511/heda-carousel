export interface Slide {
  type: string;
  headline: string;
  sub: string;
  cta?: string;
}

export interface Post {
  id: number;
  day: number;
  week: number;
  weekTitle: string;
  title: string;
  tags: string[];
  slides: Slide[];
}

export interface Week {
  num: number;
  title: string;
}

export const WEEKS: Week[] = [
  { num: 1, title: "The Motivation Lie" },
  { num: 2, title: "The Social Animal" },
  { num: 3, title: "The Identity Shift" },
  { num: 4, title: "The Tribe Exists" },
  { num: 5, title: "Competition is the Cheat Code" },
  { num: 6, title: "The Future of Gym Social" },
  { num: 7, title: "The Grind is Social" },
  { num: 8, title: "Built Different" },
  { num: 9, title: "The Movement" },
];

export const POSTS: Post[] = [
  {
    id: 1,
    day: 1,
    week: 1,
    weekTitle: "The Motivation Lie",
    title: "You don't have a motivation problem",
    tags: ["5 SLIDES", "IDENTITY REFRAME", "HIGH SAVE RATE"],
    slides: [
      {
        type: "Hook",
        headline: "You don't have a **motivation** problem.",
        sub: "Swipe if you've started over more than twice.",
      },
      {
        type: "Relatable truth",
        headline: "You've been motivated before.",
        sub: "January. After a breakup. Before summer. It came. Then left. Every single time.",
      },
      {
        type: "The Insight",
        headline: "Consistency is a **social** problem.",
        sub: "Athletes don't train alone. Teams don't win alone. Your gym streak shouldn't depend on you alone either.",
      },
      {
        type: "Solution",
        headline: "You need **people**. Not a better plan.",
        sub: "The people who actually show up have gym partners, rivals, or someone watching.",
      },
      {
        type: "Find your people",
        headline: "That's what Heda is for.",
        sub: "Match with lifters. Compete on leaderboards. Actually show up.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 2,
    day: 3,
    week: 1,
    weekTitle: "The Motivation Lie",
    title: "The 3-week quit cycle",
    tags: ["5 SLIDES", "DATA HOOK", "SHAREABLE"],
    slides: [
      {
        type: "Hook",
        headline: "80% of people quit the gym by **week 3**.",
        sub: "Here's why it's not about willpower.",
      },
      {
        type: "Relatable truth",
        headline:
          "Week 1: You're fired up. Week 2: Life hits. Week 3: Nobody notices you stopped.",
        sub: "The pattern is universal.",
      },
      {
        type: "The Insight",
        headline: "You quit because **no one cares** if you don't show up.",
        sub: "Not your alarm. Not your playlist. Not your pre-workout.",
      },
      {
        type: "Solution",
        headline: "What if someone **noticed**?",
        sub: "A gym partner. A rival. A leaderboard that exposes you.",
      },
      {
        type: "Find your people",
        headline: "Heda makes **quitting visible**.",
        sub: "When your streak is public, skipping feels different.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 3,
    day: 5,
    week: 1,
    weekTitle: "The Motivation Lie",
    title: "What fitness apps get wrong",
    tags: ["5 SLIDES", "CONTRARIAN", "DEBATE BAIT"],
    slides: [
      {
        type: "Hook",
        headline:
          "Fitness apps track **everything** except the thing that matters.",
        sub: "And nobody's talking about it.",
      },
      {
        type: "Relatable truth",
        headline:
          "You have the perfect plan. The app with the macros. The split. The tracker.",
        sub: "Still inconsistent.",
      },
      {
        type: "The Insight",
        headline: "They optimize for **information**. Not **behavior**.",
        sub: "Knowing what to do was never the problem. Doing it alone was.",
      },
      {
        type: "Solution",
        headline: "Heda doesn't give you a plan. Heda gives you **people**.",
        sub: "People who push you, compete with you, and hold you accountable.",
      },
      {
        type: "Find your people",
        headline: "Stop tracking. Start **competing**.",
        sub: "Leaderboards. Matches. Real accountability.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 4,
    day: 7,
    week: 1,
    weekTitle: "The Motivation Lie",
    title: "The accountability research",
    tags: ["5 SLIDES", "SCIENCE-BACKED", "SAVE-WORTHY"],
    slides: [
      {
        type: "Hook",
        headline: "A study found accountability increases success by **95%**.",
        sub: "Here's what that means for your gym habit.",
      },
      {
        type: "Relatable truth",
        headline:
          "You've tried going alone. You've tried discipline. You've tried motivation.",
        sub: "Same result every time.",
      },
      {
        type: "The Insight",
        headline:
          "The research is clear: **social commitment** changes behavior.",
        sub: "Not information. Not motivation. Commitment to other people.",
      },
      {
        type: "Solution",
        headline: "You need a **witness** to your effort.",
        sub: "Someone who sees your streak. Challenges your numbers. Expects you there.",
      },
      {
        type: "Find your people",
        headline: "Heda is accountability that **actually works**.",
        sub: "Find your gym people. Build your streak. Stay consistent.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 5,
    day: 8,
    week: 2,
    weekTitle: "The Social Animal",
    title: "Every athlete you admire trains with people",
    tags: ["5 SLIDES", "ASPIRATION", "SHAREABLE"],
    slides: [
      {
        type: "Hook",
        headline: "Name one elite athlete who trains **completely alone**.",
        sub: "You can't.",
      },
      {
        type: "Relatable truth",
        headline:
          "Ronaldo has teammates. Goggins has camera crews. Your favorite lifter has a crew.",
        sub: "Nobody at the top is solo.",
      },
      {
        type: "The Insight",
        headline: "Social training isn't a **luxury**. It's the **standard**.",
        sub: "The lone wolf myth is the reason most people fail.",
      },
      {
        type: "Solution",
        headline:
          "You don't need a full team. You need **one person** who matches your energy.",
        sub: "One rival. One partner. One reason to show up.",
      },
      {
        type: "Find your people",
        headline: "Heda matches you with **your people**.",
        sub: "By gym, goals, and intensity. Not random. Intentional.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 6,
    day: 10,
    week: 2,
    weekTitle: "The Social Animal",
    title: "Why you work harder when someone's watching",
    tags: ["5 SLIDES", "PSYCHOLOGY", "RELATABLE"],
    slides: [
      {
        type: "Hook",
        headline: "You lift **heavier** when someone's watching.",
        sub: "And science knows exactly why.",
      },
      {
        type: "Relatable truth",
        headline:
          "Empty gym? Cruise mode. Someone next to you? Suddenly you find another rep.",
        sub: "Every single time.",
      },
      {
        type: "The Insight",
        headline: "It's called **social facilitation**.",
        sub: "The presence of others literally elevates your performance. It's wired into your biology.",
      },
      {
        type: "Solution",
        headline: "Stop fighting your nature. **Use it**.",
        sub: "Train where people see your effort. Compete where your numbers are visible.",
      },
      {
        type: "Find your people",
        headline: "Heda puts **eyes on your effort**.",
        sub: "Leaderboards. Matches. People who actually care about your grind.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 7,
    day: 12,
    week: 2,
    weekTitle: "The Social Animal",
    title: "The gym friend you never had",
    tags: ["5 SLIDES", "EMOTIONAL", "HIGH SAVE RATE"],
    slides: [
      {
        type: "Hook",
        headline: "Most people have **zero** gym friends.",
        sub: "And it's killing their consistency.",
      },
      {
        type: "Relatable truth",
        headline: "You walk in alone. Train alone. Leave alone.",
        sub: "The gym is the most social place where nobody talks to each other.",
      },
      {
        type: "The Insight",
        headline:
          "It's not that you're antisocial. It's that there's **no easy way in**.",
        sub: "No introduction. No icebreaker. Just awkward proximity.",
      },
      {
        type: "Solution",
        headline: "What if someone **matched you** with the right gym person?",
        sub: "Same gym. Same goals. Same intensity. Already introduced.",
      },
      {
        type: "Find your people",
        headline: "Heda is the introduction you've been **waiting for**.",
        sub: "Find gym partners, rivals, and friends. Skip the awkward.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 8,
    day: 14,
    week: 2,
    weekTitle: "The Social Animal",
    title: "What a gym partner actually does",
    tags: ["5 SLIDES", "VALUE PROP", "EDUCATIONAL"],
    slides: [
      {
        type: "Hook",
        headline: "A gym partner isn't about **spotting**.",
        sub: "It's about something much bigger.",
      },
      {
        type: "Relatable truth",
        headline: "You think gym partner = someone to share a bench with.",
        sub: "That's the least important part.",
      },
      {
        type: "The Insight",
        headline: "A real gym partner creates **social cost** for quitting.",
        sub: "They make skipping feel like letting someone down. That's the magic.",
      },
      {
        type: "Solution",
        headline: "Accountability. Competition. **Expectation**.",
        sub: "That's what actually keeps you consistent. Not motivation. Obligation.",
      },
      {
        type: "Find your people",
        headline: "Heda finds you partners who **raise the stakes**.",
        sub: "Match. Compete. Actually show up for each other.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 9,
    day: 15,
    week: 3,
    weekTitle: "The Identity Shift",
    title: "The moment you became a gym person",
    tags: ["5 SLIDES", "IDENTITY", "NOSTALGIC"],
    slides: [
      {
        type: "Hook",
        headline:
          "There's a moment you stopped **going to the gym** and started **being a gym person**.",
        sub: "When was yours?",
      },
      {
        type: "Relatable truth",
        headline:
          "First it was just exercise. Then it was the schedule. Then it was the lifestyle.",
        sub: "Then it became who you are.",
      },
      {
        type: "The Insight",
        headline:
          "The shift happens when your **identity** catches up to your behavior.",
        sub: "You don't go to the gym. You are someone who trains.",
      },
      {
        type: "Solution",
        headline: "Heda is built for people who already made that **shift**.",
        sub: "Not a fitness app for beginners. A social app for gym people.",
      },
      {
        type: "Find your people",
        headline: "Claim your **identity**.",
        sub: "Join the app made for people like you.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 10,
    day: 17,
    week: 3,
    weekTitle: "The Identity Shift",
    title: "Why gym people are different",
    tags: ["5 SLIDES", "TRIBAL", "SHAREABLE"],
    slides: [
      {
        type: "Hook",
        headline: "Gym people are **wired differently**.",
        sub: "And deep down, you already know it.",
      },
      {
        type: "Relatable truth",
        headline:
          "You track protein. You plan meals. You feel guilty for missing a day.",
        sub: "Normal people don't understand this.",
      },
      {
        type: "The Insight",
        headline: "The gym isn't just a habit. It's a **value system**.",
        sub: "Discipline. Delayed gratification. Self-improvement. It filters for a certain kind of person.",
      },
      {
        type: "Solution",
        headline: "You deserve a space built for **your kind of person**.",
        sub: "Not a generic social feed. A community that speaks your language.",
      },
      {
        type: "Find your people",
        headline: "Heda is where gym people **find each other**.",
        sub: "Profiles built around lifting. Conversation built around grind.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 11,
    day: 19,
    week: 3,
    weekTitle: "The Identity Shift",
    title: "The identity you're protecting",
    tags: ["5 SLIDES", "DEEP", "EMOTIONAL"],
    slides: [
      {
        type: "Hook",
        headline:
          "You're not just building a body. You're protecting an **identity**.",
        sub: "And that's why missing a day hurts so much.",
      },
      {
        type: "Relatable truth",
        headline:
          "One missed day feels like a crack. Two feels like a collapse.",
        sub: "Because it's not about the workout. It's about who you told yourself you are.",
      },
      {
        type: "The Insight",
        headline:
          "Consistency isn't discipline. It's **identity maintenance**.",
        sub: "You show up because not showing up threatens who you've become.",
      },
      {
        type: "Solution",
        headline: "The strongest identity protection? **Community**.",
        sub: "People who reflect your values back at you. Every single day.",
      },
      {
        type: "Find your people",
        headline: "Heda protects your **streak** and your **identity**.",
        sub: "Surrounded by people who get it.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 12,
    day: 21,
    week: 3,
    weekTitle: "The Identity Shift",
    title: "Gym culture belongs to everyone",
    tags: ["5 SLIDES", "INCLUSIVE", "BRAND VALUES"],
    slides: [
      {
        type: "Hook",
        headline: "Gym culture doesn't have a **body type**.",
        sub: "It has a mindset.",
      },
      {
        type: "Relatable truth",
        headline:
          "You don't need to bench 315 to be a gym person. You just need to show up like one.",
        sub: "Consistently. Intentionally. Relentlessly.",
      },
      {
        type: "The Insight",
        headline:
          "The culture isn't about where you are. It's about the fact that you **chose this**.",
        sub: "You chose the hard thing. That's the entry ticket.",
      },
      {
        type: "Solution",
        headline: "Heda is for everyone who **chose the gym**.",
        sub: "Beginners. Veterans. Anyone who shows up and puts in the work.",
      },
      {
        type: "Find your people",
        headline: "Your people are already on **Heda**.",
        sub: "Find them. Compete with them. Grow with them.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 13,
    day: 22,
    week: 4,
    weekTitle: "The Tribe Exists",
    title: "Someone near you is training right now",
    tags: ["5 SLIDES", "PROXIMITY", "CURIOSITY"],
    slides: [
      {
        type: "Hook",
        headline: "Someone at your gym is looking for a **partner** right now.",
        sub: "You just haven't met them yet.",
      },
      {
        type: "Relatable truth",
        headline: "You see the same faces. The same regulars. The same nods.",
        sub: "But you've never actually connected.",
      },
      {
        type: "The Insight",
        headline: "Proximity without **introduction** is just coincidence.",
        sub: "You need a bridge. A reason to connect.",
      },
      {
        type: "Solution",
        headline: "Heda is the bridge between **proximity and connection**.",
        sub: "See who trains where you train. Match with them. Train together.",
      },
      {
        type: "Find your people",
        headline: "Your gym partner is **one match away**.",
        sub: "Open Heda. Find who's near you.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 14,
    day: 24,
    week: 4,
    weekTitle: "The Tribe Exists",
    title: "Your gym has a hidden community",
    tags: ["5 SLIDES", "DISCOVERY", "INTRIGUE"],
    slides: [
      {
        type: "Hook",
        headline: "There's a **community** at your gym you've never seen.",
        sub: "Because no one built the layer for it.",
      },
      {
        type: "Relatable truth",
        headline:
          "You train at the same place, same time, same days as dozens of people.",
        sub: "You share everything except conversation.",
      },
      {
        type: "The Insight",
        headline: "Every gym is a community **waiting to be activated**.",
        sub: "The people are there. The connection layer is missing.",
      },
      {
        type: "Solution",
        headline: "Heda is the **social layer** your gym never had.",
        sub: "Profiles. Matches. Leaderboards. All centered around your gym.",
      },
      {
        type: "Find your people",
        headline: "Activate your gym's **community**.",
        sub: "Join Heda. See who's already there.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 15,
    day: 26,
    week: 4,
    weekTitle: "The Tribe Exists",
    title: "The loneliest place is a crowded gym",
    tags: ["5 SLIDES", "EMOTIONAL", "HIGH SHARE"],
    slides: [
      {
        type: "Hook",
        headline: "The gym is full of people and **completely lonely**.",
        sub: "That's a design problem, not a you problem.",
      },
      {
        type: "Relatable truth",
        headline: "Headphones in. Eyes down. No conversation.",
        sub: "Everyone's there for the same reason but nobody's connecting.",
      },
      {
        type: "The Insight",
        headline: "Loneliness in the gym isn't personal. It's **structural**.",
        sub: "There's no mechanism for connection. No icebreaker. No permission.",
      },
      {
        type: "Solution",
        headline: "Heda gives you **permission to connect**.",
        sub: "Match first. Meet in person second. Skip the awkward approach.",
      },
      {
        type: "Find your people",
        headline: "End the **lonely gym era**.",
        sub: "Your people are one swipe away.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 16,
    day: 28,
    week: 4,
    weekTitle: "The Tribe Exists",
    title: "The crew changes everything",
    tags: ["5 SLIDES", "ASPIRATION", "TRIBE"],
    slides: [
      {
        type: "Hook",
        headline:
          "Show me your **gym crew** and I'll show you your **results**.",
        sub: "It's never been about the program.",
      },
      {
        type: "Relatable truth",
        headline:
          "The people who are actually jacked? They train with other jacked people.",
        sub: "The people who are consistent? They have someone expecting them.",
      },
      {
        type: "The Insight",
        headline: "Your results are a **social product**.",
        sub: "You are the average of the people you train with.",
      },
      {
        type: "Solution",
        headline: "Build your crew **intentionally**.",
        sub: "Don't leave it to chance. Choose people who match your ambition.",
      },
      {
        type: "Find your people",
        headline: "Heda builds your **crew**.",
        sub: "Match by gym. Compete by effort. Grow together.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 17,
    day: 29,
    week: 5,
    weekTitle: "Competition is the Cheat Code",
    title: "You're already competing",
    tags: ["5 SLIDES", "PROVOCATIVE", "COMPETITIVE"],
    slides: [
      {
        type: "Hook",
        headline: "You're already **competing** at the gym.",
        sub: "You're just pretending you're not.",
      },
      {
        type: "Relatable truth",
        headline:
          "You glance at the weight on someone else's bar. You notice who's bigger. You compare.",
        sub: "It's human nature.",
      },
      {
        type: "The Insight",
        headline: "Competition isn't toxic. **Hiding it** is.",
        sub: "Channel it. Make it visible. Make it a game.",
      },
      {
        type: "Solution",
        headline: "Heda makes competition **productive**.",
        sub: "Step leaderboards. Streak battles. Friendly rivalry that makes you better.",
      },
      {
        type: "Find your people",
        headline: "Stop competing in your head. Start competing on **Heda**.",
        sub: "Find your rivals. Climb the leaderboard.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 18,
    day: 31,
    week: 5,
    weekTitle: "Competition is the Cheat Code",
    title: "Leaderboards change behavior",
    tags: ["5 SLIDES", "GAMIFICATION", "SCIENCE"],
    slides: [
      {
        type: "Hook",
        headline:
          "Put someone's name on a **leaderboard** and watch what happens.",
        sub: "Behavior change, instantly.",
      },
      {
        type: "Relatable truth",
        headline:
          "You don't care about 10,000 steps. Until your friend hits 12,000.",
        sub: "Suddenly it matters.",
      },
      {
        type: "The Insight",
        headline: "Leaderboards weaponize your **ego** for good.",
        sub: "They turn abstract goals into concrete social competition.",
      },
      {
        type: "Solution",
        headline: "Heda's leaderboards make your **effort visible**.",
        sub: "Steps. Streaks. Consistency. All ranked. All public.",
      },
      {
        type: "Find your people",
        headline: "Join the **leaderboard**.",
        sub: "See where you rank. Then climb.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 19,
    day: 33,
    week: 6,
    weekTitle: "The Future of Gym Social",
    title: "Gym Tinder? No. Gym culture.",
    tags: ["5 SLIDES", "POSITIONING", "BRAND"],
    slides: [
      {
        type: "Hook",
        headline: '"So it\'s like Tinder for the gym?"',
        sub: "No. And here's why that's wrong.",
      },
      {
        type: "Relatable truth",
        headline:
          "People hear matching and think dating. But matching is just a mechanic.",
        sub: "What matters is what you're matching for.",
      },
      {
        type: "The Insight",
        headline: "Heda matches you for **accountability**, not attraction.",
        sub: "Gym partners. Training rivals. People who push you.",
      },
      {
        type: "Solution",
        headline: "It's the social layer **gym culture has been missing**.",
        sub: "Identity. Competition. Connection. Belonging.",
      },
      {
        type: "Find your people",
        headline: "Not a dating app. A **gym culture** app.",
        sub: "Built by gym people, for gym people.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 20,
    day: 35,
    week: 6,
    weekTitle: "The Future of Gym Social",
    title: "Your profile should show your grind",
    tags: ["5 SLIDES", "PRODUCT", "IDENTITY"],
    slides: [
      {
        type: "Hook",
        headline:
          "Your Instagram shows your **highlights**. Your Heda shows your **grind**.",
        sub: "There's a difference.",
      },
      {
        type: "Relatable truth",
        headline:
          "Instagram: the finished physique. The perfect angle. The curated life.",
        sub: "Nobody sees the 5am alarms and the Tuesday leg days.",
      },
      {
        type: "The Insight",
        headline:
          "Gym people want to be known for their **effort**, not just their results.",
        sub: "The process IS the identity.",
      },
      {
        type: "Solution",
        headline:
          "Heda profiles are built around **what you do**, not what you look like.",
        sub: "Streaks. Stats. Gym history. Training style.",
      },
      {
        type: "Find your people",
        headline: "Build a profile that shows your **real grind**.",
        sub: "Join Heda. Show the work.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 21,
    day: 36,
    week: 6,
    weekTitle: "The Future of Gym Social",
    title: "The app your gym needs",
    tags: ["5 SLIDES", "VISION", "MANIFESTO"],
    slides: [
      {
        type: "Hook",
        headline: "Every gym deserves a **community app**.",
        sub: "Not a booking system. A real community.",
      },
      {
        type: "Relatable truth",
        headline: "Your gym has a website for schedules and a payment portal.",
        sub: "But nothing for the people inside it.",
      },
      {
        type: "The Insight",
        headline:
          "Gyms are **communities** trapped in a **transaction model**.",
        sub: "The social layer is the missing piece.",
      },
      {
        type: "Solution",
        headline: "Heda gives every gym a **living community**.",
        sub: "Profiles. Connections. Competition. All gym-centered.",
      },
      {
        type: "Find your people",
        headline: "Bring your gym **to life**.",
        sub: "Download Heda.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 22,
    day: 38,
    week: 7,
    weekTitle: "The Grind is Social",
    title: "Nobody talks about gym loneliness",
    tags: ["5 SLIDES", "VULNERABILITY", "EMOTIONAL"],
    slides: [
      {
        type: "Hook",
        headline: "Gym loneliness is **real**.",
        sub: "But nobody's allowed to say it.",
      },
      {
        type: "Relatable truth",
        headline: "You love training. You hate that it's always alone.",
        sub: "Saying you want gym friends feels weak. It's not.",
      },
      {
        type: "The Insight",
        headline: "Wanting connection isn't weakness. It's **human design**.",
        sub: "We evolved to train, hunt, and compete in groups.",
      },
      {
        type: "Solution",
        headline: "Heda normalizes wanting **gym community**.",
        sub: "It's not soft. It's strategic.",
      },
      {
        type: "Find your people",
        headline: "Find your people on **Heda**.",
        sub: "You're not the only one looking.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 23,
    day: 40,
    week: 7,
    weekTitle: "The Grind is Social",
    title: "Your streak means nothing alone",
    tags: ["5 SLIDES", "PROVOCATIVE", "COMPETITIVE"],
    slides: [
      {
        type: "Hook",
        headline:
          "A 30-day gym streak nobody sees is just a **private hobby**.",
        sub: "Make it count.",
      },
      {
        type: "Relatable truth",
        headline:
          "You've been consistent. You've shown up. Nobody knows. Nobody cares.",
        sub: "It's quietly demoralizing.",
      },
      {
        type: "The Insight",
        headline: "Effort without **witness** loses its power.",
        sub: "Social visibility turns consistency into identity.",
      },
      {
        type: "Solution",
        headline: "Put your streak on Heda. Make it **public**.",
        sub: "Let people see. Let people compete. Let it matter.",
      },
      {
        type: "Find your people",
        headline: "Make your consistency **visible**.",
        sub: "Heda. Where effort is seen.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 24,
    day: 42,
    week: 7,
    weekTitle: "The Grind is Social",
    title: "The rival effect",
    tags: ["5 SLIDES", "PSYCHOLOGY", "COMPETITION"],
    slides: [
      {
        type: "Hook",
        headline: "Every great athlete has a **rival**.",
        sub: "Where's yours?",
      },
      {
        type: "Relatable truth",
        headline:
          "Messi had Ronaldo. Ali had Frazier. You have... your alarm clock.",
        sub: "That's not enough.",
      },
      {
        type: "The Insight",
        headline:
          "Rivals don't slow you down. They **set your ceiling higher**.",
        sub: "Competition is the most powerful motivator in human psychology.",
      },
      {
        type: "Solution",
        headline: "Find a rival on Heda. Someone who **pushes you**.",
        sub: "Same level. Same hunger. Competing on the same leaderboard.",
      },
      {
        type: "Find your people",
        headline: "Find your **rival**.",
        sub: "Heda. Where competition makes you better.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 25,
    day: 43,
    week: 8,
    weekTitle: "Built Different",
    title: "We didn't build another fitness app",
    tags: ["5 SLIDES", "MANIFESTO", "BRAND"],
    slides: [
      {
        type: "Hook",
        headline: "We didn't build another **fitness app**.",
        sub: "The world doesn't need another one.",
      },
      {
        type: "Relatable truth",
        headline: "There are 10,000 fitness apps. They all do the same thing.",
        sub: "Track. Plan. Count. Repeat.",
      },
      {
        type: "The Insight",
        headline:
          "None of them solve the **real problem**: you're doing it alone.",
        sub: "The problem was never information. It was isolation.",
      },
      {
        type: "Solution",
        headline: "Heda is the **social infrastructure** for gym culture.",
        sub: "Connection. Competition. Community. Identity.",
      },
      {
        type: "Find your people",
        headline: "This is **not another app**.",
        sub: "This is a movement. Join Heda.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 26,
    day: 45,
    week: 8,
    weekTitle: "Built Different",
    title: "Built by gym people",
    tags: ["5 SLIDES", "FOUNDER STORY", "AUTHENTIC"],
    slides: [
      {
        type: "Hook",
        headline: "Heda was built by people who **actually lift**.",
        sub: "Not a VC pitch. A real problem we lived.",
      },
      {
        type: "Relatable truth",
        headline:
          "We trained alone for years. We watched people quit because nobody held them accountable.",
        sub: "We built the solution we wished existed.",
      },
      {
        type: "The Insight",
        headline:
          "The best products are built by people who **feel the problem**.",
        sub: "Not research. Experience.",
      },
      {
        type: "Solution",
        headline:
          "Every feature in Heda exists because we **needed it ourselves**.",
        sub: "Matching. Leaderboards. Streaks. Gym profiles.",
      },
      {
        type: "Find your people",
        headline: "Built by lifters. For **lifters**.",
        sub: "Download Heda.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 27,
    day: 47,
    week: 8,
    weekTitle: "Built Different",
    title: "The gym is the last great third place",
    tags: ["5 SLIDES", "CULTURAL", "THOUGHTFUL"],
    slides: [
      {
        type: "Hook",
        headline: "The gym is the last **third place** left.",
        sub: "And nobody's treating it that way.",
      },
      {
        type: "Relatable truth",
        headline: "Coffee shops became offices. Churches emptied. Malls died.",
        sub: "The gym survived. And it's growing.",
      },
      {
        type: "The Insight",
        headline:
          "The gym is where people **actually go** in real life. Regularly. Voluntarily.",
        sub: "It's the most natural community hub of our generation.",
      },
      {
        type: "Solution",
        headline: "Heda turns the gym into a **connected community**.",
        sub: "Not just a building with equipment. A place with people.",
      },
      {
        type: "Find your people",
        headline: "The gym is your **third place**.",
        sub: "Heda makes it social.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 28,
    day: 49,
    week: 8,
    weekTitle: "Built Different",
    title: "Join the waitlist",
    tags: ["5 SLIDES", "CTA", "URGENCY"],
    slides: [
      {
        type: "Hook",
        headline: "Heda is launching in your **city soon**.",
        sub: "And the first users get something special.",
      },
      {
        type: "Relatable truth",
        headline: "You've been training alone long enough.",
        sub: "It's time.",
      },
      {
        type: "The Insight",
        headline: "Early users shape the **culture**.",
        sub: "The first people in define what Heda becomes in your gym.",
      },
      {
        type: "Solution",
        headline: "Be the first at your gym on **Heda**.",
        sub: "Set the tone. Build your crew. Lead the community.",
      },
      {
        type: "Find your people",
        headline: "Join the **waitlist**.",
        sub: "Your gym is about to get a lot more interesting.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 29,
    day: 51,
    week: 9,
    weekTitle: "The Movement",
    title: "Tag someone who needs a gym rival",
    tags: ["5 SLIDES", "VIRAL", "ENGAGEMENT"],
    slides: [
      {
        type: "Hook",
        headline: "Tag someone who needs a **gym rival**.",
        sub: "Not a supporter. A rival.",
      },
      {
        type: "Relatable truth",
        headline:
          "Support is nice. But nothing makes you train harder than someone **trying to beat you**.",
        sub: "You know exactly who this is.",
      },
      {
        type: "The Insight",
        headline: "Friendly competition > friendly support.",
        sub: "When someone's chasing your numbers, you don't skip days.",
      },
      {
        type: "Solution",
        headline: "Heda makes **rivalry productive**.",
        sub: "Leaderboards. Step challenges. Streak battles.",
      },
      {
        type: "Find your people",
        headline: "Tag your rival. Join **Heda**.",
        sub: "Let's see who's really about it.",
        cta: "↓ Link in bio",
      },
    ],
  },
  {
    id: 30,
    day: 53,
    week: 9,
    weekTitle: "The Movement",
    title: "This is just the beginning",
    tags: ["5 SLIDES", "VISION", "INSPIRING"],
    slides: [
      {
        type: "Hook",
        headline: "This is just the **beginning**.",
        sub: "Gym culture is about to change forever.",
      },
      {
        type: "Relatable truth",
        headline:
          "For too long, gym people have had no home. No app. No culture hub.",
        sub: "Scattered across Instagram, Reddit, and group chats.",
      },
      {
        type: "The Insight",
        headline: "Gym culture deserves its own **platform**.",
        sub: "Not a feature inside someone else's app. A home.",
      },
      {
        type: "Solution",
        headline: "Heda is building that **home**.",
        sub: "For every lifter. Every gym. Every city.",
      },
      {
        type: "Find your people",
        headline: "Be part of **the beginning**.",
        sub: "Download Heda. Find your people. Build the culture.",
        cta: "↓ Link in bio",
      },
    ],
  },
];

export const HASHTAGS =
  "#gymculture #heda #fitnesscommunity #gymmotivation #accountability #gympartner #liftingcrew #consistency";

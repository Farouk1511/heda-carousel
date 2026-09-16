import type { MonthDraft, PostDraft, Slide } from "../types";

const HASHTAGS = "#gympartner #accountability #fitfam #ottawagym #heda";

function slide(
  type: string,
  headline: string,
  sub: string,
  options: Pick<Slide, "cta" | "imageDesc"> = {},
): Slide {
  return { type, headline, sub, ...options };
}

function post(
  day: number,
  title: string,
  tags: string[],
  caption: string,
  slides: Slide[],
): PostDraft {
  return { day, title, tags, caption, hashtags: HASHTAGS, slides };
}

/**
 * Month 7 is value-first. Product data informs the themes, but is never the
 * subject of the post. Each carousel follows Hook → Problem → Value → Solution
 * → CTA and remains useful to someone who never downloads Heda.
 */
export const month07: MonthDraft = {
  title: "Month 7 - The Consistency Playbook",
  weeks: [
    {
      title: "Choose Better Training Partners",
      posts: [
        post(
          1,
          "Your best friend might be your worst gym partner",
          ["5 SLIDES", "CONTRARIAN", "SAVE-WORTHY"],
          "Your closest friend is not automatically your best training partner. Choose someone based on reliability, schedule overlap, and compatible effort, not history. Save the three-part test and use it before planning your next session.",
          [
            slide("Hook", "Your best friend might be your **worst gym partner**.", "Friendship and training compatibility are not the same thing."),
            slide("Problem", "You choose someone you like, not someone who fits.", "Then different schedules, goals, and effort levels turn every workout into negotiation."),
            slide("Value", "Use the **3-part fit test**.", "Same realistic time. Similar session length. Similar standard for showing up."),
            slide("Solution", "Test one session before making a routine.", "Agree on the start time, workout, and finish time. Review the fit afterward."),
            slide("CTA", "Choose compatibility over closeness.", "Use the test with someone you know, or find a better fit on Heda.", { cta: "Save the 3-part test" }),
          ],
        ),
        post(
          3,
          "The partner green flags",
          ["5 SLIDES", "PRACTICAL", "HIGH SAVE"],
          "The best gym-partner green flags appear before the first workout: clear plans, honest communication, and respect for your pace. Save this checklist before committing to a weekly routine with anyone.",
          [
            slide("Hook", "Three gym-partner **green flags** people overlook.", "None of them involve how much someone lifts."),
            slide("Problem", "Intensity gets mistaken for reliability.", "Someone can train hard and still waste your time every week."),
            slide("Value", "Look for clarity, communication, and respect.", "They name a time, warn you early, and do not turn your session into theirs."),
            slide("Solution", "Notice how they plan the first workout.", "A clear plan is the earliest preview of a reliable partnership."),
            slide("CTA", "Pick the person who makes training easier to repeat.", "Keep this checklist for your next partner.", { cta: "Save this checklist" }),
          ],
        ),
        post(
          5,
          "Ask someone to train without making it awkward",
          ["5 SLIDES", "SCRIPT", "SOCIAL SKILL"],
          "Do not ask, “Want to work out sometime?” Give someone an easy decision with a specific day, time, and session. Try: “I’m doing push at 6 on Thursday. Want to join?” Specific invitations get real answers.",
          [
            slide("Hook", "How to ask someone to train without making it **awkward**.", "Stop asking vague questions."),
            slide("Problem", "'We should work out sometime' creates work.", "They have to choose the day, time, gym, and workout before they can answer."),
            slide("Value", "Make the invitation answerable in five seconds.", "Include the day, start time, and session."),
            slide("Solution", "Send: **'Push day, Thursday at 6. Want to join?'**", "Yes, no, or another time. Every answer moves the plan forward."),
            slide("CTA", "Clear is better than clever.", "Send the script to someone today, or use it with a Heda match.", { cta: "Copy the message" }),
          ],
        ),
        post(
          6,
          "The first-workout compatibility test",
          ["5 SLIDES", "FRAMEWORK", "EDUCATIONAL"],
          "One workout can tell you whether a partnership is worth repeating. Check punctuality, pace, communication, and how you feel after the session. You are not judging the person. You are checking whether the fit works for both of you.",
          [
            slide("Hook", "One workout can tell you if the partnership will **last**.", "You just need to watch the right things."),
            slide("Problem", "Most people judge the workout by whether it felt fun.", "Fun matters. Repeatability matters more."),
            slide("Value", "Check four things: time, pace, communication, energy.", "Did they arrive? Could you follow your program? Did the session help or drain you?"),
            slide("Solution", "Afterward, ask: **Would this make next week easier?**", "If yes, schedule again immediately. If no, keep it friendly and move on."),
            slide("CTA", "A good person can still be the wrong training fit.", "Save this before your next first workout.", { cta: "Save the compatibility test" }),
          ],
        ),
        post(
          7,
          "Stop looking for one perfect partner",
          ["5 SLIDES", "REFRAME", "SHAREABLE"],
          "One person does not need to cover every workout. Build a small training bench: one reliable weekday partner, one weekend option, and one person for friendly competition. A system survives busy weeks better than a single point of failure.",
          [
            slide("Hook", "Stop looking for **one perfect gym partner**.", "Build a small bench instead."),
            slide("Problem", "One cancellation can collapse your whole routine.", "The partnership becomes a single point of failure."),
            slide("Value", "Different people can serve different roles.", "A weekday regular. A weekend backup. A rival who keeps your numbers honest."),
            slide("Solution", "Build a three-person training bench.", "You still train independently, but your routine no longer depends on one schedule."),
            slide("CTA", "Consistency needs options.", "List your three roles, then fill the missing one through your gym or Heda.", { cta: "Build your training bench" }),
          ],
        ),
      ],
    },
    {
      title: "Build Accountability That Works",
      posts: [
        post(
          8,
          "The accountability text that actually works",
          ["5 SLIDES", "SCRIPT", "ACTIONABLE"],
          "“You going today?” is easy to ignore. A better accountability message includes the plan and asks for a decision: “I’m leaving at 5:40. Are you in?” Save these messages for the day motivation disappears.",
          [
            slide("Hook", "Most accountability texts are too easy to **ignore**.", "'You going today?' is not a plan."),
            slide("Problem", "Open questions invite open-ended excuses.", "Nobody has committed to a time, place, or action."),
            slide("Value", "Good accountability asks for a decision.", "It names the moment and makes the next step obvious."),
            slide("Solution", "Send: **'I leave at 5:40. Are you in?'**", "Or: '8pm step check. Send me your number.'"),
            slide("CTA", "Make the check-in concrete.", "Save the scripts and use one today.", { cta: "Save these scripts" }),
          ],
        ),
        post(
          10,
          "Never miss twice needs a better rule",
          ["5 SLIDES", "HABIT SYSTEM", "SAVE-WORTHY"],
          "“Never miss twice” fails when the second workout is still difficult. Use a recovery version instead: after a miss, the next session only needs to be ten minutes. Protect the return before chasing performance.",
          [
            slide("Hook", "'Never miss twice' is good advice with a **missing instruction**.", "What should the comeback session look like?"),
            slide("Problem", "You miss once, then demand a perfect return.", "The pressure makes the second session easier to avoid."),
            slide("Value", "After a miss, make the return easier.", "The goal is to come back quickly, not punish yourself."),
            slide("Solution", "Use the **10-minute comeback rule**.", "Show up for ten minutes. Continue if you want. Leave guilt-free if you do not."),
            slide("CTA", "Protect the return before the performance.", "Save this for your next missed day.", { cta: "Save the comeback rule" }),
          ],
        ),
        post(
          12,
          "Make your workout harder to cancel",
          ["5 SLIDES", "BEHAVIOR DESIGN", "PRACTICAL"],
          "A workout written as “gym later” is almost designed to be cancelled. Turn it into a real appointment: exact start time, first exercise, travel trigger, and another person who knows the plan.",
          [
            slide("Hook", "Make your workout **harder to cancel** before the day begins.", "Do not rely on how motivated future-you feels."),
            slide("Problem", "'Gym later' has no edges.", "Every delay still feels technically on schedule. Then the gym closes."),
            slide("Value", "A strong plan answers four questions.", "When do you leave? Where are you going? What starts the session? Who knows?"),
            slide("Solution", "Write: **5:40 leave → 6:00 gym → start with squats → text Sam.**", "The fewer decisions left for later, the better."),
            slide("CTA", "Schedule the first five minutes, not just the workout.", "Build tonight's plan now.", { cta: "Save the four-part plan" }),
          ],
        ),
        post(
          14,
          "The weekly accountability meeting",
          ["5 SLIDES", "SYSTEM", "HIGH SAVE"],
          "Accountability does not require daily nagging. A ten-minute weekly check-in is enough: what happened, what got in the way, what is scheduled next, and where support is needed. Use this agenda with a friend every Sunday.",
          [
            slide("Hook", "The best accountability meeting takes **10 minutes**.", "Once a week. Four questions."),
            slide("Problem", "Daily check-ins become noise.", "No structure, no reflection, and eventually no replies."),
            slide("Value", "Use a weekly reset instead.", "Review the facts, remove friction, then make the next commitments visible."),
            slide("Solution", "Ask: What happened? What blocked you? What is scheduled? What support do you need?", "Put the next sessions on the calendar before ending."),
            slide("CTA", "Accountability works better with a rhythm.", "Send this agenda to your check-in person.", { cta: "Share the weekly agenda" }),
          ],
        ),
        post(
          15,
          "How to hold someone accountable without policing them",
          ["5 SLIDES", "COMMUNICATION", "RELATIONSHIP"],
          "Accountability should create support, not surveillance. Ask what they committed to, remind them why it mattered, and let them choose the next action. Never confuse helping someone with controlling them.",
          [
            slide("Hook", "Accountability should not feel like **policing**.", "If it does, the system will not last."),
            slide("Problem", "Shame creates short-term action and long-term avoidance.", "People start hiding missed days instead of recovering from them."),
            slide("Value", "Good accountability returns ownership.", "It reminds someone of their commitment without taking control of it."),
            slide("Solution", "Ask: **'What did you commit to, and what is the next smallest step?'**", "Listen first. Offer help second."),
            slide("CTA", "Support the commitment, not your preferred method.", "Share this with your accountability partner.", { cta: "Save the question" }),
          ],
        ),
      ],
    },
    {
      title: "Turn Your Gym Into a Community",
      posts: [
        post(
          17,
          "How to make a gym friend in three visits",
          ["5 SLIDES", "SOCIAL SKILL", "PRACTICAL"],
          "Gym friendships usually start smaller than people think. Visit one: make eye contact and nod. Visit two: ask a practical question. Visit three: introduce yourself. Familiarity does most of the work.",
          [
            slide("Hook", "How to make a gym friend in **three visits**.", "No forced small talk required."),
            slide("Problem", "You try to jump from stranger to conversation.", "That feels unnatural because familiarity has not had time to form."),
            slide("Value", "Build recognition before connection.", "Repeated low-pressure contact makes the introduction feel normal."),
            slide("Solution", "Visit 1: nod. Visit 2: practical question. Visit 3: exchange names.", "Small steps. Same person. No performance."),
            slide("CTA", "Do not chase a friendship. Build familiarity.", "Try step one on your next visit.", { cta: "Save the three-visit method" }),
          ],
        ),
        post(
          18,
          "The easiest gym conversation starters",
          ["5 SLIDES", "SCRIPTS", "SOCIAL VALUE"],
          "The easiest gym conversations are about the space you already share, not someone’s body. Ask how many sets they have left, whether the bench is free, or what variation they are doing. Keep it brief and let familiarity grow naturally.",
          [
            slide("Hook", "Three gym conversation starters that do not feel **forced**.", "Keep the topic inside the gym."),
            slide("Problem", "Personal questions arrive too early.", "Comments about appearance can make a normal interaction uncomfortable fast."),
            slide("Value", "Use the shared situation as the bridge.", "Equipment, exercise selection, and timing are neutral and useful."),
            slide("Solution", "Try: 'How many sets left?' 'Is this free?' 'What variation is that?'", "Ask, listen, then return to your workout."),
            slide("CTA", "Short is friendly.", "Save these for the next familiar face you see.", { cta: "Save the conversation starters" }),
          ],
        ),
        post(
          20,
          "The gym etiquette that creates community",
          ["5 SLIDES", "GYM CULTURE", "SHAREABLE"],
          "Community is built through tiny acts: rerack properly, offer to work in, wipe equipment, and acknowledge the regulars. None of this requires being outgoing. It only requires leaving the room slightly better than you found it.",
          [
            slide("Hook", "The smallest gym habits create the **strongest culture**.", "You do not need to be the loudest person there."),
            slide("Problem", "People wait for organized community events.", "Meanwhile, daily behavior is already teaching everyone whether the room is welcoming."),
            slide("Value", "Belonging is built through repeated small signals.", "Respect, awareness, and a little generosity compound."),
            slide("Solution", "Rerack. Wipe down. Offer to work in. Learn one name.", "Four actions that make any gym feel more human."),
            slide("CTA", "Culture is what regulars repeatedly do.", "Pick one action for today's session.", { cta: "Share the gym code" }),
          ],
        ),
        post(
          22,
          "How to find people at a new gym",
          ["5 SLIDES", "NEW CITY", "GUIDE"],
          "New gym? Do not try to meet everyone. Train at the same time for two weeks, notice the regulars, join one recurring class or session, and introduce yourself to one person at a time. Consistency makes you recognizable before confidence arrives.",
          [
            slide("Hook", "New gym? Do not try to meet **everyone**.", "Become recognizable to a few people first."),
            slide("Problem", "Random visit times keep resetting your social progress.", "Every workout feels like entering a new room."),
            slide("Value", "Consistency creates social familiarity.", "Same days and times expose you to the same regulars."),
            slide("Solution", "Repeat one time slot for two weeks. Join one recurring session. Learn one name.", "That is enough to stop feeling completely new."),
            slide("CTA", "Familiarity comes before belonging.", "Use the routine, or find same-gym regulars through Heda.", { cta: "Save the new-gym plan" }),
          ],
        ),
        post(
          23,
          "The quiet person is not unfriendly",
          ["5 SLIDES", "EMPATHY", "GYM CULTURE"],
          "Headphones and a serious face do not automatically mean “leave me alone forever.” Look for better signals: eye contact, removing one earbud, returning the nod, or continuing the conversation. Respect a no when you get one, but do not invent it before asking.",
          [
            slide("Hook", "The quiet person at your gym is not automatically **unfriendly**.", "Focused and closed-off are not the same thing."),
            slide("Problem", "We treat headphones like a permanent wall.", "Then two people who might get along train beside each other for years."),
            slide("Value", "Read behavior, not accessories.", "Eye contact, a returned nod, or removing one earbud are better signals."),
            slide("Solution", "Start with one practical sentence, then give space.", "If the answer opens a conversation, continue. If not, respect it."),
            slide("CTA", "Do not force a connection. Just give one a chance.", "Try one respectful opening this week.", { cta: "Save this reminder" }),
          ],
        ),
      ],
    },
    {
      title: "Use Competition Without Burning Out",
      posts: [
        post(
          24,
          "Choose a rival at your level",
          ["5 SLIDES", "COMPETITION", "FRAMEWORK"],
          "The best rival is not the strongest person you know. Choose someone close enough to catch, consistent enough to matter, and secure enough to keep it friendly. The right gap creates effort; the wrong gap creates discouragement.",
          [
            slide("Hook", "Your rival should be **slightly ahead**, not untouchable.", "The size of the gap changes the effect."),
            slide("Problem", "You compare yourself with someone in a different chapter.", "The distance is too large to guide today's behavior."),
            slide("Value", "Good rivalry needs proximity, consistency, and trust.", "Close enough to catch. Present enough to matter. Friendly enough to survive losing."),
            slide("Solution", "Choose one metric and a seven-day window.", "Steps, sessions, or total training minutes. Reset after the week."),
            slide("CTA", "Compete close. Reset often. Keep it friendly.", "Challenge someone, or use a Heda leaderboard.", { cta: "Save the rival test" }),
          ],
        ),
        post(
          25,
          "Compete on attendance before performance",
          ["5 SLIDES", "CONSISTENCY", "REFRAME"],
          "When consistency is fragile, compete on attendance before strength, pace, or physique. Count completed sessions for four weeks. You can optimize performance after showing up becomes normal.",
          [
            slide("Hook", "Compete on **attendance** before performance.", "Especially when you are rebuilding consistency."),
            slide("Problem", "Performance competitions punish normal bad days.", "One weak session starts feeling like proof that the whole plan failed."),
            slide("Value", "Attendance is binary and controllable.", "You showed up or you did not. The win survives an average workout."),
            slide("Solution", "Run a four-week attendance league.", "One point per planned session completed. No bonus for intensity."),
            slide("CTA", "Build the behavior before ranking the result.", "Send this format to your training group.", { cta: "Start an attendance league" }),
          ],
        ),
        post(
          27,
          "The leaderboard rule that prevents burnout",
          ["5 SLIDES", "BALANCE", "SAVE-WORTHY"],
          "Leaderboards should influence today’s decision, not control your life. Set a personal floor, a healthy ceiling, and one rest-day rule before competing. More is not automatically better when recovery is part of the plan.",
          [
            slide("Hook", "Use this rule before any leaderboard **uses you**.", "Competition needs boundaries."),
            slide("Problem", "A visible number can turn movement into endless catching up.", "You stop listening to recovery because somebody is always ahead."),
            slide("Value", "Set a floor, a ceiling, and a rest rule.", "Minimum effort. Maximum healthy effort. One condition that protects recovery."),
            slide("Solution", "Example: 7k floor, 15k ceiling, Sunday stays restorative.", "Keep the competition inside those boundaries."),
            slide("CTA", "The goal is consistency, not exhaustion.", "Write your three boundaries before the next challenge.", { cta: "Save the boundary rule" }),
          ],
        ),
        post(
          29,
          "Turn a losing day into useful information",
          ["5 SLIDES", "MINDSET", "ACTIONABLE"],
          "Losing a challenge is only useful if it changes the next plan. Ask whether the gap came from schedule, recovery, preparation, or effort. Adjust the system without turning the result into a judgment about yourself.",
          [
            slide("Hook", "A losing day is **data**, not a personality test.", "Use it before you judge it."),
            slide("Problem", "You turn one result into an identity.", "'I lost today' becomes 'I am inconsistent.'"),
            slide("Value", "Separate the outcome from the cause.", "Was the gap schedule, sleep, preparation, recovery, or effort?"),
            slide("Solution", "Change one variable for the rematch.", "Earlier walk. Packed bag. Lower target. Better bedtime. One adjustment."),
            slide("CTA", "Review the system, then run it again.", "Save this for the next day the numbers sting.", { cta: "Save the rematch review" }),
          ],
        ),
        post(
          30,
          "The consistency scorecard",
          ["5 SLIDES", "MONTH END", "TEMPLATE"],
          "End the month with a scorecard that measures the system instead of your appearance. Track planned sessions completed, quick recoveries after misses, check-ins made, and people helped. What gets reviewed gets improved.",
          [
            slide("Hook", "Do not end the month by judging your **body**.", "Review the system that carried it."),
            slide("Problem", "Outcome-only reviews hide the behaviors you can repeat.", "A photo cannot tell you why the month worked or why it did not."),
            slide("Value", "Score four controllable behaviors.", "Sessions completed. Misses recovered. Check-ins made. Other people supported."),
            slide("Solution", "Rate each from 1 to 5, then improve the lowest score next month.", "One weak link. One specific adjustment."),
            slide("CTA", "Review what you can repeat.", "Save the scorecard, or track the social side with Heda.", { cta: "Save the monthly scorecard" }),
          ],
        ),
      ],
    },
  ],
};

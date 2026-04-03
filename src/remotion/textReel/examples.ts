import type { ReelScene, TextReel } from "./model";
import type { Post } from "../../data/posts";
import { problemTruthSolutionCtaTemplate, provocativeReframeProductCtaTemplate, hookInsightCtaTemplate } from "./templates";

export const hedaCommunityReel = problemTruthSolutionCtaTemplate(
  {
    id: "heda-community-reel",
    slug: "heda-community-social-layer",
    title: "Hidden Community",
    topic: "Gym community activation",
    durationPreset: "15s",
  },
  {
    hook: {
      id: "s1",
      kind: "hook",
      primaryText: "There's a community at your gym you've never seen.",
      emphasisWords: ["community", "never"],
      animationPreset: "mask-reveal",
    },
    problem: {
      id: "s2",
      kind: "statement",
      primaryText:
        "You train at the same place, same time, same days as dozens of people.",
      secondaryText: "Same room. Same grind. No connection layer.",
      emphasisWords: ["same", "dozens"],
      animationPreset: "fade-up",
    },
    truth: {
      id: "s3",
      kind: "insight",
      primaryText: "You share everything except conversation.",
      secondaryText: "Proximity without introduction stays invisible.",
      emphasisWords: ["everything", "conversation"],
      animationPreset: "word-reveal",
    },
    solution: {
      id: "s4",
      kind: "product-reveal",
      primaryText: "Every gym is a community waiting to be activated.",
      secondaryText: "The people already exist. The social layer is missing.",
      emphasisWords: ["activated", "social layer"],
      animationPreset: "drift-in",
    },
    cta: {
      id: "s5",
      kind: "cta",
      primaryText: "Heda is the social layer your gym never had.",
      secondaryText: "Activate your gym's community.",
      emphasisWords: ["Heda", "social layer", "Activate"],
      promptText: "Link in bio",
      animationPreset: "mask-reveal",
    },
  }
);

export const reelTemplateSamples: TextReel[] = [
  hedaCommunityReel,
  hookInsightCtaTemplate(
    {
      id: "sample-hook-insight-cta",
      slug: "sample-hook-insight-cta",
      title: "Template Sample 1",
      topic: "Hook Insight CTA",
      durationPreset: "12s",
    },
    {
      id: "h1",
      kind: "hook",
      primaryText: "Motivation is not your real problem.",
      emphasisWords: ["real"],
    },
    {
      id: "h2",
      kind: "insight",
      primaryText: "Consistency is social when effort is visible.",
      secondaryText: "Private habits die. Public effort compounds.",
      emphasisWords: ["social", "visible"],
    },
    {
      id: "h3",
      kind: "cta",
      primaryText: "Find your people on Heda.",
      promptText: "Start your streak",
      emphasisWords: ["Heda"],
    }
  ),
  provocativeReframeProductCtaTemplate(
    {
      id: "sample-provocative-reframe-product",
      slug: "sample-provocative-reframe-product",
      title: "Template Sample 2",
      topic: "Provocative Reframe Product",
      durationPreset: "20s",
    },
    {
      provocative: {
        id: "p1",
        kind: "hook",
        primaryText: "Your streak means nothing if nobody sees it.",
        emphasisWords: ["nothing", "sees"],
      },
      reframe: {
        id: "p2",
        kind: "insight",
        primaryText: "Visibility turns effort into identity.",
        secondaryText: "Accountability works because people are watching.",
        emphasisWords: ["Visibility", "identity"],
      },
      productReveal: {
        id: "p3",
        kind: "product-reveal",
        primaryText: "Heda makes consistency public and competitive.",
        emphasisWords: ["public", "competitive"],
      },
      cta: {
        id: "p4",
        kind: "cta",
        primaryText: "Stop grinding alone.",
        secondaryText: "Join Heda and make your effort count.",
        promptText: "Join the waitlist",
        emphasisWords: ["Heda"],
      },
    }
  ),
];

export const REEL_REGISTRY: Record<string, TextReel> = reelTemplateSamples.reduce(
  (acc, reel) => {
    acc[reel.id] = reel;
    acc[reel.slug] = reel;
    return acc;
  },
  {} as Record<string, TextReel>
);

export const getReelById = (id?: string): TextReel => {
  if (!id) {
    return hedaCommunityReel;
  }
  return REEL_REGISTRY[id] ?? hedaCommunityReel;
};

export const createReelFromSequence = (input: {
  id: string;
  slug: string;
  title: string;
  topic: string;
  lines: Array<{ primaryText: string; secondaryText?: string; emphasisWords?: string[] }>;
  durationPreset?: TextReel["durationPreset"];
}): TextReel => {
  const scenes: ReelScene[] = input.lines.map((line, index) => {
    const isHook = index === 0;
    const isLast = index === input.lines.length - 1;
    return {
      id: `${input.id}-scene-${index + 1}`,
      kind: isHook ? "hook" : isLast ? "cta" : index === input.lines.length - 2 ? "product-reveal" : "statement",
      primaryText: line.primaryText,
      secondaryText: line.secondaryText,
      emphasisWords: line.emphasisWords,
      promptText: isLast ? "Link in bio" : undefined,
    };
  });

  return {
    id: input.id,
    slug: input.slug,
    title: input.title,
    topic: input.topic,
    template: "problem-truth-solution-cta",
    durationPreset: input.durationPreset ?? "15s",
    scenes,
  };
};

const stripBoldMarkers = (value: string): string => value.replace(/\*\*/g, "").trim();

export const createReelFromPost = (
  post: Post,
  options?: {
    id?: string;
    slug?: string;
    durationPreset?: TextReel["durationPreset"];
  }
): TextReel => {
  return createReelFromSequence({
    id: options?.id ?? `post-${post.id}-day-${post.day}`,
    slug: options?.slug ?? `post-${post.id}-day-${post.day}-reel`,
    title: post.title,
    topic: post.weekTitle,
    durationPreset: options?.durationPreset ?? "15s",
    lines: post.slides.map((slide) => ({
      primaryText: stripBoldMarkers(slide.headline),
      secondaryText: slide.sub,
    })),
  });
};

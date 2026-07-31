import type { Post } from "./posts/types";
import { buildPostData } from "./posts/content";
import { month01 } from "./posts/content/month-01";
import { month02 } from "./posts/content/month-02";
import { month03 } from "./posts/content/month-03";
import { month04 } from "./posts/content/months-04-06";
import { specialDrops } from "./posts/content/special-drops";

export type {
  MockupLayout,
  MonthDraft,
  Post,
  PostDraft,
  Slide,
  SlideMockup,
  SlideTextTransform,
  Week,
  WeekDraft,
} from "./posts/types";

export const POST_MONTHS = [month01, month02, month03, month04, specialDrops];

const { weeks, posts } = buildPostData(POST_MONTHS);

export const WEEKS = weeks;
export const POSTS = posts;

// Instagram stopped rewarding volume here: hashtag following was removed and
// their ranking weight cut, so discovery now runs on caption keywords. Five is
// the working ceiling — one audience tag, two topic tags, one local, one brand.
// Broad tags (#fitness, #workout, #health) are dropped on purpose: at hundreds
// of millions of posts they bury a launch-sized account instead of placing it.
export const HASHTAGS =
  "#gympartner #accountability #fitfam #ottawagym #heda";

/**
 * The caption as published: a post's own copy when it has one, otherwise a
 * headline + subline + swipe prompt built from slide 1. Hashtags are appended
 * separately so the default set can change without rewriting every caption.
 */
export function buildCaption(post: Post): string {
  const body = post.caption ?? defaultCaptionBody(post);
  return `${body}\n\n${post.hashtags ?? HASHTAGS}`;
}

function defaultCaptionBody(post: Post): string {
  const headline = post.slides[0].headline.replace(/\*\*/g, "");
  return `${headline}\n\n${post.slides[0].sub}\n\nSwipe through for the full truth. ➡️`;
}

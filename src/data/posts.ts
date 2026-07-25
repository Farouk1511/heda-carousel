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

export const HASHTAGS =
  "#gym #ottawafitness #ottawa #gymmotivation #fitness #workout #health";

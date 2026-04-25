import { buildPostData } from "./posts/content";
import { month01 } from "./posts/content/month-01";
import { month02 } from "./posts/content/month-02";

export type {
  MonthDraft,
  Post,
  PostDraft,
  Slide,
  Week,
  WeekDraft,
} from "./posts/types";

export const POST_MONTHS = [month01, month02];

const { weeks, posts } = buildPostData(POST_MONTHS);

export const WEEKS = weeks;
export const POSTS = posts;

export const HASHTAGS =
  "#gym #ottawafitness #ottawa #gymmotivation #fitness #workout #health";
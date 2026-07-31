import type { MonthDraft, Post, Week } from "./types";

function assertValidMonths(months: MonthDraft[]) {
  for (const month of months) {
    for (const week of month.weeks) {
      if (!week.title.trim()) {
        throw new Error(`Week title is required in month \"${month.title}\".`);
      }

      for (const post of week.posts) {
        if (post.day <= 0) {
          throw new Error(`Post day must be positive for \"${post.title}\".`);
        }

        if (!post.slides.length) {
          throw new Error(`Post \"${post.title}\" must include at least one slide.`);
        }
      }
    }
  }
}

export function buildPostData(months: MonthDraft[]) {
  assertValidMonths(months);

  const weeks: Week[] = [];
  const posts: Post[] = [];
  let weekNum = 1;
  let postId = 1;

  for (const month of months) {
    for (const week of month.weeks) {
      weeks.push({ num: weekNum, title: week.title });

      for (const post of week.posts) {
        posts.push({
          id: postId,
          day: post.day,
          week: weekNum,
          weekTitle: week.title,
          title: post.title,
          tags: post.tags,
          caption: post.caption,
          hashtags: post.hashtags,
          slides: post.slides,
        });
        postId++;
      }

      weekNum++;
    }
  }

  return { weeks, posts };
}

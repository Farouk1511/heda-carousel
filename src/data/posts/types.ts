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

export interface PostDraft {
  day: number;
  title: string;
  tags: string[];
  slides: Slide[];
}

export interface WeekDraft {
  title: string;
  posts: PostDraft[];
}

export interface MonthDraft {
  title: string;
  weeks: WeekDraft[];
}

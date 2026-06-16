export type MockupLayout = "free" | "text-top" | "text-bottom" | "text-left" | "text-right";

export interface SlideTextTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface SlideMockup {
  src: string;
  name?: string;
  layout: MockupLayout;
  offsetX: number;
  offsetY: number;
  scale: number;
  fit: "contain";
}

export interface Slide {
  type: string;
  headline: string;
  sub: string;
  cta?: string;
  mockup?: SlideMockup;
  textTransform?: SlideTextTransform;
  image?: string;
  imageDesc?: string;
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

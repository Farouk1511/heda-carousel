import type { DurationPreset, ReelScene, TextReel } from "./model";

interface TemplateBase {
  id: string;
  slug: string;
  title: string;
  topic: string;
  durationPreset?: DurationPreset;
}

const build = (base: TemplateBase, template: TextReel["template"], scenes: ReelScene[]): TextReel => ({
  ...base,
  template,
  durationPreset: base.durationPreset ?? "15s",
  scenes,
});

export const hookInsightCtaTemplate = (
  base: TemplateBase,
  hook: ReelScene,
  insight: ReelScene,
  cta: ReelScene
): TextReel =>
  build(base, "hook-insight-cta", [
    { ...hook, kind: "hook" },
    { ...insight, kind: "insight" },
    { ...cta, kind: "cta" },
  ]);

export const problemTruthSolutionCtaTemplate = (
  base: TemplateBase,
  scenes: {
    hook: ReelScene;
    problem: ReelScene;
    truth: ReelScene;
    solution: ReelScene;
    cta: ReelScene;
  }
): TextReel =>
  build(base, "problem-truth-solution-cta", [
    { ...scenes.hook, kind: "hook" },
    { ...scenes.problem, kind: "statement" },
    { ...scenes.truth, kind: "insight" },
    { ...scenes.solution, kind: "product-reveal" },
    { ...scenes.cta, kind: "cta" },
  ]);

export const provocativeReframeProductCtaTemplate = (
  base: TemplateBase,
  scenes: {
    provocative: ReelScene;
    reframe: ReelScene;
    productReveal: ReelScene;
    cta: ReelScene;
  }
): TextReel =>
  build(base, "provocative-reframe-product-cta", [
    { ...scenes.provocative, kind: "hook" },
    { ...scenes.reframe, kind: "insight" },
    { ...scenes.productReveal, kind: "product-reveal" },
    { ...scenes.cta, kind: "cta" },
  ]);

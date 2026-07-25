import type { CanvasElement, Design, DesignBackground, DesignSize } from "./types";
import { newId } from "./defaults";
import { makeImageElement, makeShapeElement, makeTextElement } from "./elements";

export interface TemplateContext {
  logoAssetId?: string;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  description: string;
  build: (ctx: TemplateContext) => {
    background: DesignBackground;
    elements: CanvasElement[];
  };
}

function logo(ctx: TemplateContext, fx: number, fy: number, w = 180): CanvasElement | null {
  if (!ctx.logoAssetId) return null;
  return makeImageElement(ctx.logoAssetId, 0.28, { fx, fy, w, fit: "contain" });
}

export const TEMPLATES: MarketingTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Empty canvas",
    build: () => ({ background: { type: "color", color: "brand:bg" }, elements: [] }),
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Big headline + subtext",
    build: (ctx) => ({
      background: { type: "color", color: "brand:bg" },
      elements: [
        makeTextElement({
          fx: 0.5,
          fy: 0.4,
          text: "Big **announcement**",
          fontSize: 104,
          fontFamily: "display",
          fontWeight: 800,
          color: "brand:text",
          maxWidth: 900,
          letterSpacing: -0.02,
          lineHeight: 1.03,
        }),
        makeTextElement({
          fx: 0.5,
          fy: 0.6,
          text: "Tell people what's new in one clear line.",
          fontSize: 38,
          fontFamily: "body",
          fontWeight: 500,
          color: "brand:accentLight",
          maxWidth: 780,
          lineHeight: 1.3,
        }),
        logo(ctx, 0.5, 0.88, 150),
      ].filter(Boolean) as CanvasElement[],
    }),
  },
  {
    id: "product",
    name: "Product Shot",
    description: "Image with caption",
    build: (ctx) => ({
      background: { type: "color", color: "brand:bg" },
      elements: [
        makeImageElement("", 0.75, {
          fx: 0.5,
          fy: 0.42,
          w: 640,
          fit: "contain",
          shadow: true,
        }),
        makeTextElement({
          fx: 0.5,
          fy: 0.82,
          text: "Meet **your product**",
          fontSize: 64,
          fontFamily: "display",
          fontWeight: 700,
          color: "brand:text",
          maxWidth: 900,
        }),
        logo(ctx, 0.12, 0.08, 130),
      ].filter(Boolean) as CanvasElement[],
    }),
  },
  {
    id: "quote",
    name: "Quote",
    description: "Pull-quote + attribution",
    build: (ctx) => ({
      background: { type: "color", color: "brand:bg" },
      elements: [
        makeTextElement({
          fx: 0.5,
          fy: 0.44,
          text: "“This changed ==everything== for our team.”",
          fontSize: 72,
          fontFamily: "display",
          fontWeight: 700,
          color: "brand:text",
          maxWidth: 880,
          lineHeight: 1.15,
        }),
        makeTextElement({
          fx: 0.5,
          fy: 0.68,
          text: "— Happy Customer, CEO",
          fontSize: 34,
          fontFamily: "body",
          fontWeight: 500,
          color: "brand:accentLight",
          maxWidth: 700,
        }),
        logo(ctx, 0.5, 0.88, 140),
      ].filter(Boolean) as CanvasElement[],
    }),
  },
  {
    id: "promo",
    name: "Promo / CTA",
    description: "Accent background + button",
    build: (ctx) => ({
      background: { type: "color", color: "brand:accent" },
      elements: [
        makeTextElement({
          fx: 0.5,
          fy: 0.36,
          text: "Limited time offer",
          fontSize: 92,
          fontFamily: "display",
          fontWeight: 800,
          color: "#ffffff",
          maxWidth: 880,
          lineHeight: 1.05,
        }),
        makeTextElement({
          fx: 0.5,
          fy: 0.55,
          text: "Save 30% this week only.",
          fontSize: 40,
          fontFamily: "body",
          fontWeight: 500,
          color: "#ffffff",
          maxWidth: 760,
        }),
        makeShapeElement({
          fx: 0.5,
          fy: 0.72,
          shape: "rect",
          w: 360,
          h: 108,
          fill: "#ffffff",
          borderRadius: 54,
        }),
        makeTextElement({
          fx: 0.5,
          fy: 0.72,
          text: "Get started",
          fontSize: 40,
          fontFamily: "display",
          fontWeight: 700,
          color: "brand:accent",
          maxWidth: 360,
        }),
        logo(ctx, 0.5, 0.9, 140),
      ].filter(Boolean) as CanvasElement[],
    }),
  },
  {
    id: "stat",
    name: "Stat",
    description: "Big number + label",
    build: (ctx) => ({
      background: { type: "color", color: "brand:bg" },
      elements: [
        makeTextElement({
          fx: 0.5,
          fy: 0.42,
          text: "{big}10,000+{/}",
          fontSize: 150,
          fontFamily: "display",
          fontWeight: 800,
          color: "brand:accent",
          maxWidth: 900,
          lineHeight: 1,
        }),
        makeTextElement({
          fx: 0.5,
          fy: 0.62,
          text: "happy members and counting",
          fontSize: 40,
          fontFamily: "body",
          fontWeight: 500,
          color: "brand:text",
          maxWidth: 760,
        }),
        logo(ctx, 0.5, 0.88, 140),
      ].filter(Boolean) as CanvasElement[],
    }),
  },
];

export function instantiateTemplate(
  template: MarketingTemplate,
  name: string,
  sizes: DesignSize[],
  ctx: TemplateContext
): Design {
  const { background, elements } = template.build(ctx);
  return {
    id: newId("design"),
    name,
    templateId: template.id,
    background,
    elements,
    sizes,
  };
}

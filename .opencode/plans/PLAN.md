# ContentDeck -- Master Plan

## What is ContentDeck?

A **Next.js full-stack SaaS** where users sign up, configure their brand (name, colors, logo, fonts), generate social media carousel content with an AI copilot, visually edit slides, and export to multiple formats. Freemium monetization with usage-tracked limits.

**Evolved from:** `heda-carousel` -- an internal Vite + React tool at `C:\Users\kazee\Documents\heda-carousel` for generating Instagram carousel images and Remotion video reels for a single brand (Heda gym app).

**New project location:** `C:\Users\kazee\Documents\contentdeck`

---

## Core Product Features

1. **Brand Configuration** -- Users define their brand (name, handle, logo, colors, fonts, templates) and all generated content reflects it
2. **AI Content Generation** -- Full carousel post generation from a topic/niche, plus slide-level rewriting copilot and brand setup assistant
3. **Visual Carousel Editor** -- Real-time preview with inline editing, drag-and-drop slide reorder, variable slide counts
4. **Multi-Format Export** -- PNG images at configurable aspect ratios (1:1, 4:5, 9:16), bulk ZIP downloads, Remotion video reels
5. **Freemium Monetization** -- Free tier with limited AI generations and exports, paid plans for unlimited usage

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | **Next.js 14+** (App Router) | Full-stack: SSR pages, API routes, server actions |
| Language | **TypeScript** | Strict mode |
| Styling | **Tailwind CSS** | Replace current App.css; dynamic theming via CSS vars |
| Database | **PostgreSQL + Prisma** | Type-safe ORM, migrations, seeding |
| Auth | **NextAuth.js v5 (Auth.js)** | Email/password + Google OAuth |
| AI | **OpenAI API** (GPT-4o-mini / GPT-4o) | Server-side, platform pays for API calls |
| Payments | **Stripe** | Subscriptions, webhooks, customer portal |
| Image Gen | **Satori + @vercel/og** or **Puppeteer** | Server-side carousel image rendering |
| Video Gen | **Remotion** (existing) | Keep existing Remotion compositions for reel export |
| File Storage | **Vercel Blob** or **Cloudflare R2** | Logo uploads, exported assets |
| Hosting | **Vercel** | Native Next.js, serverless functions, edge |
| ZIP | **JSZip** | Client or server-side bulk ZIP generation |

---

## Architecture Overview

```
contentdeck/
  app/
    (marketing)/              -- Landing page, pricing
      page.tsx
      pricing/page.tsx
    (auth)/                   -- Auth pages
      login/page.tsx
      signup/page.tsx
      layout.tsx
    (dashboard)/              -- Authenticated app
      layout.tsx              -- Sidebar nav, brand context provider
      brands/
        page.tsx              -- List brands
        new/page.tsx          -- Create brand (AI-assisted setup)
        [brandId]/
          settings/page.tsx   -- Edit brand config
      projects/
        page.tsx              -- List projects
        new/page.tsx
        [projectId]/
          page.tsx            -- Post list within project
          posts/
            [postId]/
              page.tsx        -- THE CAROUSEL EDITOR (main UI)
    api/
      ai/
        generate/route.ts     -- Full post generation
        rewrite/route.ts      -- Slide-level copilot
        brand-setup/route.ts  -- Brand config suggestions
      export/
        image/route.ts        -- Server-side image rendering
        zip/route.ts          -- Bulk ZIP generation
        reel/route.ts         -- Remotion reel rendering (optional)
      webhooks/
        stripe/route.ts       -- Stripe subscription webhooks
  components/
    card/                     -- Carousel card renderer (from heda-carousel)
      Card.tsx
      CardDots.tsx
      BoldText.tsx
    editor/                   -- Editor UI components
      Preview.tsx
      SlideEditor.tsx
      SlideList.tsx
      ExportPanel.tsx
      BulkExportModal.tsx
      AICopilotPanel.tsx
    brand/                    -- Brand config UI
      BrandForm.tsx
      ColorPicker.tsx
      FontSelector.tsx
      LogoUpload.tsx
    ui/                       -- Shared UI primitives
      Button.tsx, Modal.tsx, ProgressBar.tsx, ...
  lib/
    db.ts                     -- Prisma client singleton
    auth.ts                   -- Auth config
    ai.ts                     -- OpenAI client + prompt templates
    stripe.ts                 -- Stripe client + helpers
    brand-context.tsx         -- React context for active brand
    export/
      dimensions.ts           -- Aspect ratio -> pixel mapping
      image-renderer.ts       -- Server-side image generation
      zip-builder.ts          -- ZIP assembly
    remotion/                 -- Remotion compositions (migrated)
      index.ts, Root.tsx, ReelComposition.tsx, reelPreset.ts
      textReel/               -- Entire textReel directory (migrated as-is)
  prisma/
    schema.prisma
    seed.ts
  public/
    default-logo.png
  styles/
    globals.css               -- Tailwind directives + base styles
```

---

## Execution Phases

Execute in this order. Each phase has a detailed spec doc.

| # | Spec Doc | Description | Effort |
|---|----------|-------------|--------|
| 1 | `docs/01-project-setup.md` | Next.js init, folder structure, Tailwind, base layout | 1 day |
| 2 | `docs/02-database-schema.md` | Prisma schema: Users, Brands, Projects, Posts | 0.5 day |
| 3 | `docs/03-auth.md` | NextAuth setup, login/signup pages, middleware | 1 day |
| 4 | `docs/04-brand-system.md` | Brand CRUD, theme engine, dynamic fonts, logo upload | 1.5 days |
| 5 | `docs/05-editor.md` | Carousel editor page, Card refactor, preview, export | 2 days |
| 6 | `docs/06-ai-integration.md` | AI generation endpoints, copilot, brand setup | 2 days |
| 7 | `docs/07-export-system.md` | Server-side image gen, ZIP, bulk export, Remotion | 1.5 days |
| 8 | `docs/08-monetization.md` | Stripe subscriptions, plan tiers, usage tracking | 1.5 days |
| 9 | `docs/09-deployment.md` | Vercel deployment, env vars, production checklist | 0.5 day |
| Ref | `docs/10-migration-reference.md` | File-by-file map of what to copy from heda-carousel | Reference |

**Total: ~12 days**

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Server-side image gen | Satori/`@vercel/og` primary, Puppeteer fallback | Satori is fast + serverless; Puppeteer for complex cards |
| State management | Server state (React Query) + URL params + Zustand for editor | Most data in DB; editor needs fast local state |
| Card rendering | Keep React inline styles (not Tailwind) for Card.tsx | Card must render identically in browser AND server-side; inline styles are portable across both |
| Remotion | Keep as CLI scripts initially, API route later | CPU-heavy rendering; decouple from web requests |
| AI model | GPT-4o-mini for generations, GPT-4o for brand setup | Cost optimization |
| Multi-tenancy | Row-level via Prisma `where` clauses | Simple, scalable |

---

## MVP Scope (Phases 1-7)

A user can: sign up, create a brand, generate AI carousel posts, edit slides visually, export at multiple aspect ratios. Phase 8-9 are post-MVP.

## Non-Goals (for now)

- Scheduling/publishing to social platforms
- Collaborative editing
- Custom card templates/layouts beyond the dark-card design
- Mobile app
- Multi-language support

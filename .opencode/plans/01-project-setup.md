# Phase 1: Project Setup

## Goal
Initialize a Next.js 14+ project with App Router, TypeScript, Tailwind CSS, and the base folder structure.

---

## Step 1: Create Next.js Project

```bash
cd C:\Users\kazee\Documents\contentdeck
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Choose these options when prompted:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: `@/*`

---

## Step 2: Install Dependencies

```bash
# Core
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install openai
npm install stripe @stripe/stripe-js
npm install zustand
npm install @tanstack/react-query

# Image/export
npm install satori @vercel/og
npm install jszip
npm install sharp

# Remotion (for video reels -- install later if needed)
npm install remotion @remotion/bundler @remotion/renderer @remotion/cli @remotion/google-fonts

# UI utilities
npm install clsx tailwind-merge
npm install lucide-react          # Icon library
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-checkbox
npm install react-hot-toast       # Toast notifications
npm install react-colorful        # Color picker

# Dev
npm install -D prisma
npm install -D @types/node
npm install -D tsx                # For CLI scripts
```

---

## Step 3: Folder Structure

Create the following directory structure:

```
src/
  app/
    (marketing)/
      page.tsx                    -- Landing page (placeholder)
      pricing/
        page.tsx                  -- Pricing page (placeholder)
      layout.tsx                  -- Marketing layout (no sidebar)
    (auth)/
      login/
        page.tsx
      signup/
        page.tsx
      layout.tsx                  -- Auth layout (centered card)
    (dashboard)/
      layout.tsx                  -- Dashboard layout (sidebar + main)
      brands/
        page.tsx                  -- Brand list
        new/
          page.tsx                -- Create brand
        [brandId]/
          settings/
            page.tsx              -- Brand settings
      projects/
        page.tsx                  -- Project list
        new/
          page.tsx                -- Create project
        [projectId]/
          page.tsx                -- Post list
          posts/
            [postId]/
              page.tsx            -- CAROUSEL EDITOR
    api/
      ai/
        generate/
          route.ts
        rewrite/
          route.ts
        brand-setup/
          route.ts
      export/
        image/
          route.ts
        zip/
          route.ts
      webhooks/
        stripe/
          route.ts
    layout.tsx                    -- Root layout
    globals.css
  components/
    card/
      Card.tsx
      CardDots.tsx
      BoldText.tsx
    editor/
      Preview.tsx
      SlideEditor.tsx
      SlideList.tsx
      ExportPanel.tsx
      BulkExportModal.tsx
      AICopilotPanel.tsx
    brand/
      BrandForm.tsx
      ColorPicker.tsx
      FontSelector.tsx
      LogoUpload.tsx
    layout/
      DashboardSidebar.tsx
      DashboardHeader.tsx
    ui/
      Button.tsx
      Modal.tsx
      ProgressBar.tsx
      Input.tsx
      Textarea.tsx
      Badge.tsx
  lib/
    db.ts
    auth.ts
    ai.ts
    stripe.ts
    brand-context.tsx
    utils.ts                      -- cn() helper, etc.
    export/
      dimensions.ts
      image-renderer.ts
      zip-builder.ts
    remotion/
      (migrated files go here)
  types/
    index.ts                      -- Shared types (Brand, Post, Slide, etc.)
  prisma/
    schema.prisma
    seed.ts
```

Create directories with:
```bash
# From project root (C:\Users\kazee\Documents\contentdeck)
# Most of src/app/ is created by create-next-app; add the rest:

mkdir -p src/app/(marketing)/pricing
mkdir -p src/app/(auth)/login src/app/(auth)/signup
mkdir -p src/app/(dashboard)/brands/new src/app/(dashboard)/brands/[brandId]/settings
mkdir -p src/app/(dashboard)/projects/new src/app/(dashboard)/projects/[projectId]/posts/[postId]
mkdir -p src/app/api/ai/generate src/app/api/ai/rewrite src/app/api/ai/brand-setup
mkdir -p src/app/api/export/image src/app/api/export/zip
mkdir -p src/app/api/webhooks/stripe
mkdir -p src/components/card src/components/editor src/components/brand src/components/layout src/components/ui
mkdir -p src/lib/export src/lib/remotion
mkdir -p src/types
mkdir -p prisma
```

---

## Step 4: Tailwind Configuration

Update `tailwind.config.ts` to include the ContentDeck design tokens derived from the heda-carousel design system:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          glow: "var(--accent-glow)",
        },
        surface: {
          root: "var(--bg-root)",
          panel: "var(--bg-panel)",
          topbar: "var(--bg-topbar)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Step 5: Global CSS

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Default theme -- overridden per-brand via CSS vars */
  --accent: #705bcf;
  --accent-light: #8b7ad8;
  --accent-glow: rgba(112, 91, 207, 0.3);
  --bg-root: #0a0a12;
  --bg-panel: #0e0e18;
  --bg-topbar: #0c0c16;
  --text: #e8e6f0;
  --text-muted: rgba(232, 230, 240, 0.5);
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

body {
  background: var(--bg-root);
  color: var(--text);
  font-family: var(--font-body);
}
```

---

## Step 6: Utility Helper

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 7: Root Layout

Update `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ContentDeck -- AI Carousel Generator",
  description: "Generate branded social media carousel content with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

---

## Step 8: Placeholder Pages

Create minimal placeholder pages so the app runs:

**`src/app/(marketing)/page.tsx`:**
```tsx
export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-4xl font-display font-bold text-accent">ContentDeck</h1>
    </div>
  );
}
```

**`src/app/(dashboard)/layout.tsx`:**
```tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-surface-panel border-r border-accent/10 p-4">
        <h2 className="text-lg font-display font-bold text-accent">ContentDeck</h2>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
```

---

## Step 9: Verify Setup

```bash
npm run dev
```

Visit `http://localhost:3000` -- should see the ContentDeck placeholder page with correct fonts and dark theme.

---

## Step 10: Initialize Git

```bash
git init
git add .
git commit -m "feat: initial Next.js project setup with Tailwind and folder structure"
```

---

## Done Criteria

- [ ] Next.js app runs at localhost:3000
- [ ] Tailwind styling works with custom CSS variables
- [ ] All three fonts (Space Grotesk, DM Sans, JetBrains Mono) load correctly
- [ ] Folder structure matches the architecture in PLAN.md
- [ ] All placeholder pages render without errors
- [ ] Git repo initialized with first commit

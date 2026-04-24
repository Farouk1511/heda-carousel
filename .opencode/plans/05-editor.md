# Phase 5: Editor

## Goal
Build the main carousel editor page with branded card preview, slide editing, reorder, and post persistence.

## Primary Migration Rule
Migrate UI behavior from `heda-carousel` but remove Heda-specific hardcoded logic.

## Step 1: Migrate Card Renderer
Source files:
- `src/components/Card.tsx`
- `src/components/CardDots.tsx`
- `src/components/BoldText.tsx`

Target path:
- `src/components/card/*`

Refactor requirements:
- consume brand tokens from props/context
- remove `theme === "deep"` hardcoded color branches
- keep width/height scale factor behavior for export parity
- support aspect ratios: `1:1`, `4:5`, `9:16`

## Step 2: Editor State
Create `src/lib/editor-store.ts` (Zustand):
- `post`
- `selectedSlideIndex`
- actions: set post, update slide, add slide, remove slide, reorder slides

## Step 3: Editor Components
Create:
- `src/components/editor/Preview.tsx`
- `src/components/editor/SlideEditor.tsx`
- `src/components/editor/SlideList.tsx`
- `src/components/editor/ExportPanel.tsx`
- `src/components/editor/AICopilotPanel.tsx` (placeholder wired for phase 6)

## Step 4: Editor Page
Create `src/app/(dashboard)/projects/[projectId]/posts/[postId]/page.tsx`:
- load post + project + brand
- initialize store
- left: slide list
- center: preview
- right: slide fields + export controls

## Step 5: Editing Behavior
Support:
- inline text edit (headline/sub/cta)
- add/remove slides
- drag and drop reorder
- variable slide count (not fixed to 5)
- auto-save (debounced 500-800ms)

## Step 6: Persistence
Create API route:
- `src/app/api/posts/[postId]/route.ts`

Methods:
- `GET` post detail
- `PATCH` post updates (`title`, `slides`, `tags`, `hashtags`, `status`)

Ownership checks:
- user must own brand through project chain.

## Done Criteria
- [ ] Editor renders existing post data
- [ ] Slide CRUD and reorder work
- [ ] Card uses brand tokens and dynamic fonts
- [ ] Changes auto-save and survive refresh
- [ ] Works on desktop and mobile breakpoints

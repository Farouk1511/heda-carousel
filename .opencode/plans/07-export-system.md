# Phase 7: Export System

## Goal
Implement server-side image exports, bulk ZIP download, and Remotion reel generation flow.

## Step 1: Export Dimensions
Create `src/lib/export/dimensions.ts`:

```ts
export const EXPORT_DIMENSIONS = {
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "9:16": { width: 1080, height: 1920 },
} as const;
```

## Step 2: Image Renderer
Create `src/lib/export/image-renderer.ts`:
- input: post, brand config, ratio
- output: one PNG per slide
- primary engine: Satori + `@vercel/og`
- fallback engine path: Puppeteer adapter when needed

Parity requirement:
- exported card must match on-screen card style and text wrapping.

## Step 3: Image Export API
Create `src/app/api/export/image/route.ts`:
- input: postId + ratio
- auth + ownership check
- return array of image URLs or binary response for single export

## Step 4: ZIP Builder
Create `src/lib/export/zip-builder.ts` using `JSZip`.
- naming format: `{post-title}-{ratio}-slide-{n}.png`
- output as stream/blob response

## Step 5: Bulk ZIP API
Create `src/app/api/export/zip/route.ts`:
- input: `postIds[]` + selected ratios
- process each post/ratio
- package all into one zip
- return downloadable archive

## Step 6: Editor Export UX
Create `src/components/editor/BulkExportModal.tsx`:
- post picker
- ratio multi-select
- progress feedback
- abort/cancel handling

## Step 7: Remotion Integration
Migrate existing `src/remotion/` into `src/lib/remotion/`.
Create either:
- API trigger route `src/app/api/export/reel/route.ts`, or
- background CLI script for render queue

Initial recommendation:
- keep reel export as server script/worker in MVP
- provide UI button that queues job

## Done Criteria
- [ ] Single post export works for all ratios
- [ ] Bulk export zip works for multiple posts/ratios
- [ ] Exported images match preview rendering closely
- [ ] Reel render flow is callable from app (API or worker trigger)

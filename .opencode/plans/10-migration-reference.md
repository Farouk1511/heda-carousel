# Migration Reference: heda-carousel -> ContentDeck

## Goal
Provide a file-by-file map of what to copy, adapt, or rewrite from `heda-carousel`.

## Legend
- `COPY`: move with minimal changes
- `ADAPT`: keep structure but refactor
- `REWRITE`: implement fresh in Next.js architecture

## Core Editor and Card
- `src/components/Card.tsx` -> `src/components/card/Card.tsx` (`ADAPT`)
  - keep scaling/export behavior
  - replace hardcoded theme branches with brand token props
- `src/components/CardDots.tsx` -> `src/components/card/CardDots.tsx` (`ADAPT`)
  - dot colors/styles from brand config
- `src/components/BoldText.tsx` -> `src/components/card/BoldText.tsx` (`COPY`)
- `src/components/Preview.tsx` -> `src/components/editor/Preview.tsx` (`ADAPT`)
- `src/components/EditPanel.tsx` -> split into `SlideEditor`, `ExportPanel`, `AICopilotPanel` (`REWRITE`)
- `src/components/Sidebar.tsx` -> project/post list UI (`ADAPT`)
- `src/components/BulkExportModal.tsx` -> `src/components/editor/BulkExportModal.tsx` (`ADAPT`)

## Data and Theme
- `src/data/posts.ts` (`ADAPT`)
  - migrate sample content into seed scripts/templates
  - remove hardcoded Heda brand references from defaults
- `src/data/themes.ts` (`ADAPT`)
  - convert to brand config defaults and CSS variable mapper
- `src/hooks/useCarouselState.ts` (`REWRITE`)
  - replace with Zustand + server persistence

## Export
- `src/utils/export.ts` (`ADAPT`)
  - keep offscreen full-size render logic as parity reference
  - move final implementation server-side in `src/lib/export/*`

## App Shell
- `src/App.tsx` (`REWRITE`)
  - split into Next.js app router pages/layouts
- `src/App.css` (`REWRITE`)
  - migrate to Tailwind + CSS vars

## Remotion
- `src/remotion/*` -> `src/lib/remotion/*` (`COPY` then `ADAPT`)
  - keep `textReel` architecture
  - replace `DEFAULT_BRANDING` with brand-driven values
- `render.ts` (`ADAPT`)
  - convert to server job/worker entrypoint
- `remotion.config.ts` (`COPY`)

## Legacy Reference
- `index.old.html` (`REFERENCE ONLY`)
  - keep only as export-behavior historical reference

## High-Risk Migration Points
- Card visual parity between preview and export
- Dynamic font loading consistency (web + export + remotion)
- Removing all `Heda`/`HEDA` hardcoded strings from user-facing defaults
- Theme token unification across CSS vars, Card props, Remotion branding

## Verification Matrix
- [ ] Card renders same style in editor and export output
- [ ] Multi-ratio exports preserve typography and spacing
- [ ] Brand changes propagate to preview and exports
- [ ] No Heda-specific copy remains in product defaults
- [ ] Remotion reel uses active brand colors/name/logo

# Phase 4: Brand System

## Goal
Implement brand CRUD, theme token engine, dynamic font loading, and logo upload.

## Key Requirement
Eliminate hardcoded color/font logic from card rendering. Card must render from brand tokens only.

## Step 1: Brand Types and Defaults
Create/confirm:
- `src/types/index.ts` brand interfaces
- `src/lib/brand-defaults.ts` with full default theme

## Step 2: Brand Data Layer
Create:
- `src/lib/brands.ts`

Functions:
- `getBrandsByUser(userId)`
- `getBrandById(userId, brandId)`
- `createBrand(userId, input)`
- `updateBrand(userId, brandId, input)`
- `deleteBrand(userId, brandId)`

Enforce ownership in every query (`where: { id: brandId, userId }`).

## Step 3: Brand Context
Create `src/lib/brand-context.tsx`:
- store active brand
- expose brand + setter
- persist selected brand in URL or localStorage

Wrap dashboard layout with provider.

## Step 4: Theme Engine
Create `src/lib/theme.ts`:
- `brandToCssVars(config)` returns CSS custom property map
- `applyBrandTheme(config, rootElement)` applies variables

Variables must include accent, backgrounds, text colors, highlight, dot colors, and card gradient tokens.

## Step 5: Dynamic Fonts
Create `src/lib/font-loader.ts`:
- generate Google Fonts URL for selected brand fonts
- inject/update one `<link data-brand-fonts>` tag
- fallback to safe defaults when unavailable

## Step 6: Brand UI
Create components:
- `src/components/brand/BrandForm.tsx`
- `src/components/brand/ColorPicker.tsx`
- `src/components/brand/FontSelector.tsx`
- `src/components/brand/LogoUpload.tsx`

Pages:
- `src/app/(dashboard)/brands/page.tsx`
- `src/app/(dashboard)/brands/new/page.tsx`
- `src/app/(dashboard)/brands/[brandId]/settings/page.tsx`

## Step 7: Logo Upload API
Create `src/app/api/brands/logo/route.ts`:
- accept image file
- validate size/type
- upload to Vercel Blob (or R2 adapter)
- return URL

## Step 8: Apply Theme Globally in Dashboard
In dashboard layout:
- fetch active brand server-side
- hydrate brand context
- apply CSS vars and fonts on mount

## Done Criteria
- [ ] User can create/edit/delete brands
- [ ] Theme changes immediately update UI
- [ ] Fonts update dynamically per brand
- [ ] Logo upload works and persists URL
- [ ] Brand ownership checks enforced

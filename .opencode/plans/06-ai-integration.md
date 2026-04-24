# Phase 6: AI Integration

## Goal
Add AI endpoints for full post generation, slide rewrite copilot, and AI-assisted brand setup.

## Model Strategy
- Default: `gpt-4o-mini` for post generation/rewrites
- Premium assist: `gpt-4o` for brand setup suggestions

## Step 1: OpenAI Client
Create `src/lib/ai.ts`:
- initialize OpenAI SDK with `OPENAI_API_KEY`
- helper for JSON schema output
- timeout + retry wrapper

## Step 2: Prompt Templates
Create `src/lib/ai-prompts.ts`:
- `generatePostPrompt`
- `rewriteSlidePrompt`
- `brandSetupPrompt`

Inputs include:
- niche
- tone
- target audience
- objective
- brand config

## Step 3: API - Generate Post
Create `src/app/api/ai/generate/route.ts`:
- input: topic, niche, audience, tone, desired slideCount
- output schema:
  - `title`
  - `slides[]` ({ type, headline, sub, cta? })
  - `tags[]`
  - `hashtags`
- create post row in DB and return post

## Step 4: API - Rewrite Slide
Create `src/app/api/ai/rewrite/route.ts`:
- input: slide, instruction, brand voice
- output: rewritten slide preserving required fields

## Step 5: API - Brand Setup
Create `src/app/api/ai/brand-setup/route.ts`:
- input: business description + target audience + vibe keywords
- output:
  - suggested name/handle
  - color palette
  - font pairing
  - voice keywords

## Step 6: Editor Integration
Wire in `AICopilotPanel`:
- rewrite selected slide
- regenerate full post
- accept/reject suggestions

## Step 7: Validation and Safety
- validate payloads with `zod`
- strip disallowed markdown/html
- enforce max slide count and length limits
- log model usage metadata per request

## Done Criteria
- [ ] AI post generation endpoint works with structured output
- [ ] Slide rewrite works from editor
- [ ] Brand setup suggestions populate brand form
- [ ] Invalid responses are handled gracefully with retries/fallback

# Phase 9: Deployment

## Goal
Deploy ContentDeck to Vercel with production-ready configuration.

## Step 1: Provision Services
- PostgreSQL (Neon, Supabase, RDS, or Railway)
- Vercel Blob (or R2)
- OpenAI API key
- Stripe product/price + webhook endpoint
- Google OAuth production credentials

## Step 2: Configure Environment Variables (Vercel)
Set all required vars:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- blob storage keys if used

## Step 3: Build + Migrate Strategy
Use Prisma migrate in CI/deploy:

```bash
npx prisma migrate deploy
```

Avoid `migrate dev` in production.

## Step 4: Vercel Project Setup
- import Git repository into Vercel
- framework preset: Next.js
- node runtime: compatible with Next.js 14+
- configure regions if needed for latency

## Step 5: Health Verification
After deployment verify:
- login/signup
- brand CRUD
- AI generation
- export image/zip
- Stripe checkout + webhook

## Step 6: Monitoring
- enable Vercel logs/alerts
- add error reporting (Sentry recommended)
- add rate limiting for AI/export endpoints

## Production Checklist
- [ ] All env vars present in Production + Preview
- [ ] Database SSL enabled
- [ ] Webhook signatures verified
- [ ] Route protection confirmed
- [ ] Limits enforced server-side
- [ ] Backups configured for database

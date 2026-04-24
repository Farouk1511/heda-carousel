# Phase 8: Monetization

## Goal
Add Stripe subscriptions, free/pro gating, and monthly usage enforcement.

## Plans
- FREE: limited generations/exports
- PRO: high or unlimited limits

Limits are defined in `src/types/index.ts` (`PLAN_LIMITS`) and enforced server-side.

## Step 1: Stripe Setup
Create `src/lib/stripe.ts`:
- initialize Stripe server client
- helper methods for checkout session and customer portal session

Required env vars:

```env
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_PRO_MONTHLY=""
```

## Step 2: Billing APIs
Create:
- `src/app/api/billing/checkout/route.ts`
- `src/app/api/billing/portal/route.ts`

Checkout behavior:
- create or reuse Stripe customer
- create subscription checkout session for PRO
- set success/cancel URLs

## Step 3: Webhook Handler
Create `src/app/api/webhooks/stripe/route.ts`:
- verify Stripe signature
- handle events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- update `Subscription` row fields

## Step 4: Usage Tracking
Create `src/lib/usage.ts`:
- `assertCanGenerate(userId)`
- `assertCanExport(userId)`
- increment counters after successful operations
- monthly reset when `usagePeriodStart` is older than current billing month

Integrate checks into:
- `POST /api/ai/generate`
- `POST /api/ai/rewrite`
- export routes

## Step 5: Pricing and Billing UI
Create:
- `src/app/(marketing)/pricing/page.tsx`
- `src/components/billing/PlanCard.tsx`
- `src/components/billing/UsageMeter.tsx`

Inside dashboard add:
- current plan badge
- usage counters
- upgrade/manage billing buttons

## Done Criteria
- [ ] User can upgrade to PRO via Stripe Checkout
- [ ] Webhooks keep subscription state in sync
- [ ] FREE limits are enforced on AI/export endpoints
- [ ] Usage counters are visible and accurate

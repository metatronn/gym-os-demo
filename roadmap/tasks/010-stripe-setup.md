# Task 010: Stripe Subscriptions & Billing

**Phase:** 2 — Billing & Onboarding
**Priority:** Critical
**Depends on:** [003](./003-environment-secrets.md), [007](./007-db-schema.md), [009](./009-onboarding-flow.md)
**Blocks:** [011](./011-stripe-webhooks.md), [012](./012-billing-page.md)

---

## Objective

Set up Stripe products, integrate Checkout for subscription sign-up, and build the billing management flow. The business model: 14-day free trial, then monthly subscription.

## Steps

### 1. Install Dependencies

```bash
npm install stripe
```

### 2. Stripe Client

Create `src/lib/stripe.ts`:

```ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});
```

### 3. Create Products in Stripe Dashboard

Create these in the Stripe Dashboard (not via API — dashboard is the source of truth for products):

| Product | Price | Trial | Notes |
|---------|-------|-------|-------|
| **GYM OS Pro** | $149/month (or your price) | 14-day free trial | The main subscription |

Copy the `price_id` into `STRIPE_PRICE_ID_PRO` env var.

### 4. Checkout Session API Route

Create `src/app/api/stripe/checkout/route.ts`:

```ts
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  const { orgId, userId } = await requireAuth();

  // Get or create Stripe customer
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, orgId));

  let customerId = tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { tenantId: orgId, clerkUserId: userId },
    });
    customerId = customer.id;

    await db.update(tenants)
      .set({ stripeCustomerId: customerId })
      .where(eq(tenants.id, orgId));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{
      price: process.env.STRIPE_PRICE_ID_PRO!,
      quantity: 1,
    }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { tenantId: orgId },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { tenantId: orgId },
  });

  return NextResponse.json({ url: session.url });
}
```

### 5. Customer Portal API Route

Create `src/app/api/stripe/portal/route.ts`:

```ts
import { stripe } from '@/lib/stripe';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  const { orgId } = await requireAuth();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, orgId));

  if (!tenant?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: tenant.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
```

### 6. Stripe Customer Portal Configuration

In Stripe Dashboard → Settings → Customer Portal:

- Enable **Cancel subscription**
- Enable **Switch plan** (if you add more tiers later)
- Enable **Update payment method**
- Enable **View invoice history**
- Set branding (logo, colors to match GYM OS dark theme)

### 7. Local Development: Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# The CLI prints a webhook signing secret — use it in .env.local
```

## Acceptance Criteria

- `stripe` package installed with typed client
- Checkout session creates a subscription with 14-day trial
- Customer portal allows self-serve billing management
- Stripe customer is linked to tenant via `stripeCustomerId`
- Local webhook forwarding works via Stripe CLI

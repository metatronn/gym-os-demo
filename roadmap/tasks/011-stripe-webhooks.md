# Task 011: Stripe Webhook Handler

**Phase:** 2 — Billing & Onboarding
**Priority:** Critical
**Depends on:** [010](./010-stripe-setup.md)
**Blocks:** [012](./012-billing-page.md), [017](./017-inngest-background-jobs.md)

---

## Objective

Handle all Stripe webhook events to keep the `tenants` table subscription status in sync with Stripe. This is the single source of truth for "is this gym allowed to use the app?"

## Steps

### 1. Webhook Route

Create `src/app/api/webhooks/stripe/route.ts`:

```ts
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
  }

  return new Response('ok');
}
```

### 2. Handler Functions

```ts
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId) return;

  await db.update(tenants)
    .set({
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      subscriptionStatus: 'active',
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId;
  if (!tenantId) return;

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'unpaid',
    incomplete_expired: 'canceled',
    paused: 'canceled',
  };

  await db.update(tenants)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: statusMap[subscription.status] ?? subscription.status,
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId;
  if (!tenantId) return;

  await db.update(tenants)
    .set({
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Log the payment in our payments table
  // Also a good trigger for Slack notification: "Payment received: $149 from Undisputed Boxing"
  const tenantId = invoice.subscription_details?.metadata?.tenantId;
  if (!tenantId) return;

  // Insert into payments table (see Task 007 schema)
  // Send Slack notification (see Task 018)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Critical: trigger dunning email sequence
  // Send Slack notification: "Payment FAILED for Undisputed Boxing"
  // This is where Inngest jobs come in (Task 017)
  const tenantId = invoice.subscription_details?.metadata?.tenantId;
  if (!tenantId) return;

  await db.update(tenants)
    .set({
      subscriptionStatus: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));
}
```

### 3. Webhook Security

- The route MUST verify the Stripe signature before processing
- The route is excluded from Clerk auth middleware (it's in the public routes list)
- Always return `200` even if processing fails (Stripe retries on non-2xx)
- Log errors but don't expose them in the response

### 4. Testing Webhooks

```bash
# Stripe CLI forwards events to your local server:
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events:
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.deleted
```

### 5. Idempotency

Stripe may deliver the same event multiple times. The handler must be idempotent:
- Use `event.id` to deduplicate if needed (store processed event IDs)
- All handlers use `UPDATE ... SET` which is naturally idempotent
- The `insert` for payments should use `ON CONFLICT DO NOTHING` on the Stripe payment intent ID

## Acceptance Criteria

- Webhook verifies Stripe signature (rejects invalid)
- `checkout.session.completed` links Stripe customer + subscription to tenant
- Subscription status changes are reflected in the `tenants` table in real-time
- `invoice.payment_failed` marks tenant as `past_due`
- `customer.subscription.deleted` marks tenant as `canceled`
- Webhook is idempotent (safe to receive duplicate events)
- All events can be tested locally via `stripe listen`

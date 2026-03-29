# Task 012: Billing Page (Real Subscription Management)

**Phase:** 2 — Billing & Onboarding
**Priority:** High
**Depends on:** [010](./010-stripe-setup.md), [011](./011-stripe-webhooks.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Replace the current mock billing page with a real one that shows subscription status, invoices, and links to the Stripe Customer Portal for management.

## Steps

### 1. Server Component Data Fetching

The billing page becomes a server component that fetches real data:

```tsx
// src/app/billing/page.tsx
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import { BillingClient } from './billing-client';

export default async function BillingPage() {
  const { orgId } = await requireAuth();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, orgId));

  let subscription = null;
  let invoices: any[] = [];

  if (tenant.stripeSubscriptionId) {
    subscription = await stripe.subscriptions.retrieve(tenant.stripeSubscriptionId);
    const invoiceList = await stripe.invoices.list({
      customer: tenant.stripeCustomerId!,
      limit: 12,
    });
    invoices = invoiceList.data;
  }

  return (
    <BillingClient
      subscriptionStatus={tenant.subscriptionStatus}
      trialEndsAt={tenant.trialEndsAt?.toISOString() ?? null}
      currentPeriodEnd={subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null}
      invoices={invoices.map(inv => ({
        id: inv.id,
        amount: inv.amount_paid / 100,
        status: inv.status,
        date: new Date(inv.created * 1000).toISOString(),
        invoiceUrl: inv.hosted_invoice_url,
      }))}
    />
  );
}
```

### 2. Client Component

Create `src/app/billing/billing-client.tsx`:

- **Status Card:** Shows current plan, status (trialing/active/past_due/canceled), next billing date
- **Upgrade Button:** Calls `/api/stripe/checkout` → redirects to Stripe Checkout
- **Manage Billing Button:** Calls `/api/stripe/portal` → redirects to Stripe Customer Portal
- **Invoice History:** Table of past invoices with links to Stripe-hosted invoice PDFs

### 3. Subscription Status Display

| Status | UI |
|--------|-----|
| `trialing` | Blue badge, "X days left", upgrade CTA |
| `active` | Green badge, next billing date, manage button |
| `past_due` | Red badge, "Payment failed — update your card", urgent CTA |
| `canceled` | Gray badge, "Your subscription has ended", re-subscribe CTA |
| No subscription | Pricing cards with trial CTA |

### 4. Preserve Existing Design

The current billing page has a nice design. Keep the same layout, colors, and card patterns — just wire it to real data instead of mock data.

## Acceptance Criteria

- Billing page shows real subscription status from the database
- "Upgrade" button starts a Stripe Checkout session
- "Manage Billing" button opens the Stripe Customer Portal
- Invoice history shows real invoices with PDF links
- Status badges match subscription state (trial, active, past due, canceled)
- Design matches the existing dark theme

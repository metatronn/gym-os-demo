# Billing & Stripe

**When to use:** Working on anything related to payments, subscriptions, or the billing page.

## Architecture

```
User clicks "Upgrade" → API route creates Checkout Session → Stripe Checkout
                                                                  ↓
Stripe fires webhooks → /api/webhooks/stripe → updates tenants table
                                                                  ↓
                                                          Inngest jobs (dunning email, Slack)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client singleton |
| `src/app/api/stripe/checkout/route.ts` | Creates Checkout sessions |
| `src/app/api/stripe/portal/route.ts` | Creates Customer Portal sessions |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler (signature verified) |
| `src/app/billing/page.tsx` | Billing page (server component) |

## Subscription Lifecycle

```
Trial (14 days) → Active → (payment fails) → Past Due → (grace period) → Canceled
                       ↘ (user cancels) → Canceled
```

## Webhook Events We Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Link Stripe customer + subscription to tenant |
| `customer.subscription.updated` | Sync subscription status to tenant |
| `customer.subscription.deleted` | Mark tenant as canceled |
| `invoice.paid` | Log payment, send Slack notification |
| `invoice.payment_failed` | Mark as past_due, trigger dunning sequence |

## Testing Locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
stripe trigger invoice.payment_failed
```

## Rules

- ALWAYS verify webhook signatures before processing
- ALWAYS use `tenantId` from metadata, not from the request
- NEVER trust client-side payment state
- Webhook handlers MUST be idempotent (Stripe delivers at-least-once)

## Related
- [Task 010 — Stripe Setup](../../../roadmap/tasks/010-stripe-setup.md)
- [Task 011 — Webhooks](../../../roadmap/tasks/011-stripe-webhooks.md)
- [Task 012 — Billing Page](../../../roadmap/tasks/012-billing-page.md)
- [billing-engineer agent](../../agents/billing-engineer.md)

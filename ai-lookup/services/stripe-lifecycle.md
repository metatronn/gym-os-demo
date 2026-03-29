# Stripe Subscription Lifecycle

**Last Updated:** 2026-03-29
**Confidence:** High

## Summary
Stripe is the source of truth for subscription state. The `tenants` table caches the status, synced via webhooks. Subscription state gates access to the app.

**Key Facts:**
- 14-day free trial, no credit card required
- Single plan: GYM OS Pro ($149/mo or configured price)
- Stripe Customer Portal for self-serve billing management
- Webhook-driven sync: Stripe → `tenants.subscriptionStatus`

**File Pointers:**
- Stripe client: `src/lib/stripe.ts`
- Webhook handler: `src/app/api/webhooks/stripe/route.ts`
- Subscription check: `src/lib/subscription.ts`

## Status Flow
```
trialing → active → past_due → canceled
                  ↘ canceled (user cancels)
```

## Status → Access
| Status | App Access |
|--------|-----------|
| `trialing` (not expired) | Full access + trial banner |
| `active` | Full access |
| `past_due` | Full access + warning banner |
| `canceled` | Locked, upgrade CTA only |

## Related Topics
- [Multi-tenancy](../patterns/multi-tenancy.md)

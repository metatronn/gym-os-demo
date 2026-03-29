# Task 024: Security Hardening & Tenant Isolation Audit

**Phase:** 5 — Polish & Hardening
**Priority:** Critical
**Depends on:** [008](./008-tenant-middleware.md), [011](./011-stripe-webhooks.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Audit every data path for tenant isolation. Add rate limiting, CSRF protection, and security headers. This is the "sleep well at night" task.

## Steps

### 1. Tenant Isolation Audit

Go through every query, server action, and API route:

- [ ] Every `SELECT` includes `WHERE tenant_id = ?`
- [ ] Every `UPDATE` includes `WHERE tenant_id = ? AND id = ?`
- [ ] Every `DELETE` includes `WHERE tenant_id = ? AND id = ?`
- [ ] No API route accepts a `tenantId` parameter from the client (always from auth)
- [ ] No route renders data without checking auth first
- [ ] Webhook routes verify signatures (Stripe, Clerk)

Write a simple integration test that:
1. Creates two tenants
2. Inserts data for each
3. Queries as tenant A → asserts no data from tenant B visible

### 2. Rate Limiting

Install `@upstash/ratelimit` + `@upstash/redis` (or use Vercel KV):

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),  // 100 requests per minute
  analytics: true,
});
```

Apply to:
- API routes (100/min per tenant)
- Auth routes (10/min per IP — already handled by Clerk)
- Webhook routes (exempt — they're from Stripe/Clerk)

### 3. Security Headers

In `next.config.mjs`, add headers:

```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }];
}
```

### 4. Input Validation

- All server actions validate input shape (use Zod or manual checks)
- All API routes validate request body
- No raw SQL — Drizzle handles parameterization
- No `dangerouslySetInnerHTML` without sanitization

### 5. Webhook Signature Verification

Verify both webhook routes have proper signature checking:
- Stripe: `stripe.webhooks.constructEvent()` (Task 011)
- Clerk: `svix.verify()` (Task 009)

Both should return 400 on invalid signature — never process unverified payloads.

### 6. Environment Variable Audit

- No `NEXT_PUBLIC_` prefix on server-only secrets
- No secrets in client bundles (check Next.js build output)
- All required vars validated at startup (Task 003)

## Acceptance Criteria

- Every data query is tenant-scoped (manual audit complete)
- Integration test proves cross-tenant isolation
- Rate limiting is active on API routes
- Security headers are set on all responses
- Input validation exists on all server actions
- Webhook signatures are verified
- No secrets are exposed in client bundles

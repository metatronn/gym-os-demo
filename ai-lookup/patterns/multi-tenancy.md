# Multi-Tenancy Model

**Last Updated:** 2026-03-29
**Confidence:** High

## Summary
GYM OS uses native organizations as the multi-tenancy primitive. One organization = one gym. All database tables have a `tenant_id` column storing the organization ID from the JWT session. Every query filters by `tenant_id`, sourced from `requireAuth()`.

**Key Facts:**
- Tenant ID = organization ID from JWT session
- Row-level isolation, not schema or database isolation
- `tenantId` MUST come from `requireAuth()`, never from client input
- Every table except `tenants` has a `tenant_id` foreign key

**File Pointers:**
- Tenant schema: `src/db/schema/tenants.ts`
- Tenant middleware: `src/db/tenant.ts`
- Auth helper: `src/lib/auth.ts`
- Query pattern: `src/db/queries/members.ts` (canonical example)

## How It Works
1. User authenticates → JWT contains `userId` and `orgId`
2. `requireAuth()` extracts `orgId` from JWT session
3. All query helpers take `tenantId` as first argument
4. Drizzle queries include `WHERE tenant_id = ?` automatically

## Related Topics
- [Subscription lifecycle](../services/stripe-lifecycle.md)

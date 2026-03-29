# Multi-Tenancy Model

**Last Updated:** 2026-03-29
**Confidence:** High

## Summary
GYM OS uses Clerk Organizations as the multi-tenancy primitive. One Organization = one gym. All database tables have a `tenant_id` column storing the Clerk `orgId`. Every query filters by `tenant_id`, sourced from `auth()`.

**Key Facts:**
- Tenant ID = Clerk Organization ID (`orgId`)
- Row-level isolation, not schema or database isolation
- `tenantId` MUST come from `auth()`, never from client input
- Every table except `tenants` has a `tenant_id` foreign key

**File Pointers:**
- Tenant schema: `src/db/schema/tenants.ts`
- Tenant middleware: `src/db/tenant.ts`
- Auth helper: `src/lib/auth.ts`
- Query pattern: `src/db/queries/members.ts` (canonical example)

## How It Works
1. User authenticates via Clerk → gets `userId` and `orgId`
2. `requireAuth()` extracts `orgId` from Clerk session
3. All query helpers take `tenantId` as first argument
4. Drizzle queries include `WHERE tenant_id = ?` automatically

## Related Topics
- [Subscription lifecycle](../services/stripe-lifecycle.md)

# Task 008: Tenant Middleware & Data Access Layer

**Phase:** 1 — Foundation
**Priority:** Critical
**Depends on:** [006](./006-clerk-auth.md), [007](./007-db-schema.md)
**Blocks:** [009](./009-onboarding-flow.md), [013](./013-members-crud.md), [014](./014-leads-pipeline.md)

---

## Objective

Create a data access layer that automatically scopes every query to the current tenant. No developer should ever have to remember to add `WHERE tenant_id = ?` — it happens automatically.

## Steps

### 1. Tenant-Scoped Query Helpers

Create `src/db/tenant.ts`:

```ts
import { db } from '@/db';
import { eq, and, SQL } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import type { PgTable } from 'drizzle-orm/pg-core';

/**
 * Returns a db instance and the current tenant ID.
 * Use this at the top of every server action / API route.
 */
export async function tenantDb() {
  const { orgId: tenantId, userId } = await requireAuth();

  return {
    db,
    tenantId,
    userId,

    /**
     * Helper: adds tenant_id filter to any query condition.
     * Usage: where(tenantFilter(members, eq(members.status, 'active')))
     */
    tenantFilter<T extends { tenantId: any }>(
      table: T,
      ...conditions: SQL[]
    ) {
      return and(eq(table.tenantId, tenantId), ...conditions);
    },
  };
}
```

### 2. CRUD Helper Pattern

Create `src/db/queries/members.ts` as the pattern for all entities:

```ts
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export function memberQueries(tenantId: string) {
  return {
    async list() {
      return db.select()
        .from(members)
        .where(eq(members.tenantId, tenantId))
        .orderBy(desc(members.createdAt));
    },

    async getById(id: string) {
      const [member] = await db.select()
        .from(members)
        .where(and(
          eq(members.tenantId, tenantId),
          eq(members.id, id),
        ));
      return member ?? null;
    },

    async create(data: Omit<typeof members.$inferInsert, 'tenantId'>) {
      const [member] = await db.insert(members)
        .values({ ...data, tenantId })
        .returning();
      return member;
    },

    async update(id: string, data: Partial<typeof members.$inferInsert>) {
      const [member] = await db.update(members)
        .set({ ...data, updatedAt: new Date() })
        .where(and(
          eq(members.tenantId, tenantId),
          eq(members.id, id),
        ))
        .returning();
      return member;
    },

    async delete(id: string) {
      await db.delete(members)
        .where(and(
          eq(members.tenantId, tenantId),
          eq(members.id, id),
        ));
    },
  };
}
```

### 3. Server Action Pattern

Create `src/app/members/actions.ts` to demonstrate the pattern:

```ts
'use server';

import { requireAuth } from '@/lib/auth';
import { memberQueries } from '@/db/queries/members';

export async function getMembers() {
  const { orgId } = await requireAuth();
  return memberQueries(orgId).list();
}

export async function getMember(id: string) {
  const { orgId } = await requireAuth();
  return memberQueries(orgId).getById(id);
}
```

### 4. Tenant Subscription Check Middleware

Create `src/lib/subscription.ts`:

```ts
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export async function getTenantSubscription(tenantId: string) {
  const [tenant] = await db.select({
    subscriptionStatus: tenants.subscriptionStatus,
    trialEndsAt: tenants.trialEndsAt,
  })
  .from(tenants)
  .where(eq(tenants.id, tenantId));

  if (!tenant) return null;

  const isTrialExpired = tenant.trialEndsAt && new Date() > tenant.trialEndsAt;
  const isActive = tenant.subscriptionStatus === 'active' ||
    (tenant.subscriptionStatus === 'trialing' && !isTrialExpired);

  return {
    ...tenant,
    isActive,
    isTrialExpired,
  };
}

export async function requireActiveSubscription(tenantId: string) {
  const sub = await getTenantSubscription(tenantId);
  if (!sub?.isActive) {
    throw new Error('Subscription required');
  }
  return sub;
}
```

### 5. Cross-Tenant Security Audit Pattern

Document this rule for all future code:

> **RULE:** Never pass a raw `id` from user input directly to a query without also filtering by `tenantId`. The `memberQueries(tenantId).getById(id)` pattern handles this — the `AND tenant_id = ?` clause means a user from Tenant A can never access data from Tenant B, even if they guess the ID.

## File Structure After This Task

```
src/
  db/
    index.ts
    tenant.ts           # tenantDb() helper
    queries/
      members.ts        # Member CRUD (pattern for all entities)
      leads.ts          # (created in Task 014)
      classes.ts        # (created in Task 015)
      ...
    schema/
      ...
  lib/
    auth.ts             # requireAuth(), requireAdmin()
    subscription.ts     # Subscription check helpers
```

## Acceptance Criteria

- `tenantDb()` returns a scoped context with `tenantId` from Clerk
- Every query helper automatically filters by `tenantId`
- CRUD pattern is established and documented for all future entities
- Subscription status check helper exists and works
- No query in the codebase can accidentally return cross-tenant data

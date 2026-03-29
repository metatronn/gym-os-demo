# Authentication & Multi-Tenancy

**When to use:** Working on auth, tenant isolation, user roles, or the middleware.

## Architecture

```
Request → Clerk Middleware (src/middleware.ts)
              ↓
    Public? → Allow (sign-in, webhooks, health)
    Private? → Check auth → Extract userId, orgId, orgRole
              ↓
    No org? → Redirect to /onboarding
    Has org? → Continue to page/action
```

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Clerk middleware — protects all routes |
| `src/lib/auth.ts` | `requireAuth()`, `requireAdmin()` helpers |
| `src/lib/subscription.ts` | `requireActiveSubscription()` helper |
| `src/db/tenant.ts` | `tenantDb()` — scoped database context |
| `src/db/queries/*.ts` | All query files — every one takes `tenantId` |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in page |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up page |
| `src/app/onboarding/page.tsx` | Gym creation flow |

## Multi-Tenancy Model

| Clerk Concept | GYM OS Concept | DB Column |
|--------------|----------------|-----------|
| Organization | Gym (tenant) | `tenants.id` |
| Organization Member | Staff member | Clerk-managed |
| Organization Role | Permission level | `orgRole` |

### Roles

| Role | Access |
|------|--------|
| `org:admin` | Full access, settings, billing, staff management |
| `org:coach` | Schedule, floor plan, members, check-ins |
| `org:staff` | Members (read), check-ins, tasks |

## Data Access Pattern

```tsx
// In any server action or server component:
const { orgId } = await requireAuth();
const members = await memberQueries(orgId).list();
// orgId comes from Clerk, NEVER from the request
```

## Public Routes (No Auth Required)

- `/sign-in`, `/sign-up`
- `/api/webhooks/stripe`
- `/api/webhooks/clerk`
- `/api/health`
- `/` (landing page, when built)

## Rules

- `tenantId` ALWAYS comes from `auth()`, NEVER from client input
- Every query helper takes `tenantId` as its first argument
- Admin-only pages check `orgRole` server-side
- Webhook routes verify signatures, not Clerk auth

## Related
- [Task 006 — Clerk Auth](../../../roadmap/tasks/006-clerk-auth.md)
- [Task 008 — Tenant Middleware](../../../roadmap/tasks/008-tenant-middleware.md)
- [tenant-security-auditor agent](../../agents/tenant-security-auditor.md)

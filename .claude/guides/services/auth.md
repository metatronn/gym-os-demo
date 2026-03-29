# Authentication & Multi-Tenancy

**When to use:** Working on auth, tenant isolation, user roles, or the middleware.

## Architecture

```
Request → JWT Middleware (src/middleware.ts)
              ↓
    Public? → Allow (sign-in, sign-up, /api/auth/*, webhooks, health)
    Private? → Verify JWT → Extract userId, orgId, orgRole from token
              ↓
    No org? → Redirect to /onboarding
    Has org? → Continue to page/action
```

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | JWT verification — protects all routes |
| `src/lib/auth.ts` | `requireAuth()`, `requireAdmin()` helpers |
| `src/lib/subscription.ts` | `requireActiveSubscription()` helper |
| `src/db/tenant.ts` | `tenantDb()` — scoped database context |
| `src/db/queries/*.ts` | All query files — every one takes `tenantId` |
| `src/app/api/auth/*` | Sign-in, sign-up, sign-out, forgot-password, reset-password |
| `src/app/sign-in/page.tsx` | Sign-in form |
| `src/app/sign-up/page.tsx` | Sign-up form |
| `src/app/onboarding/page.tsx` | Gym creation flow |

## Multi-Tenancy Model

| Concept | GYM OS Concept | DB Table |
|---------|----------------|----------|
| Organization | Gym (tenant) | `tenants` |
| Staff member | User with org access | `staff_memberships` |
| Role | Permission level | `staff_memberships.role` |

### Roles

| Role | Access |
|------|--------|
| `org:admin` | Full access, settings, billing, staff management |
| `org:coach` | Schedule, floor plan, members, check-ins |
| `org:staff` | Members (read), check-ins, tasks |

## Session Token

```
JWT payload {
  sub: "user_abc123"    // user ID
  tid: "tenant_xyz789"  // active tenant ID
  role: "org:admin"     // role in active tenant
  iat: 1711670400
  exp: 1711756800       // 24h, sliding window
}
```

Signed with `AUTH_SECRET` (HS256 via `jose`). Stored in `__session` httpOnly cookie.

## Data Access Pattern

```tsx
// In any server action or server component:
const { orgId } = await requireAuth();
const members = await memberQueries(orgId).list();
// orgId comes from the JWT, NEVER from the request
```

## Public Routes (No Auth Required)

- `/sign-in`, `/sign-up`
- `/api/auth/*` (sign-in, sign-up, forgot-password, etc.)
- `/api/webhooks/stripe`
- `/api/health`
- `/` (landing page, when built)

## Rules

- `tenantId` ALWAYS comes from `auth()`, NEVER from client input
- Every query helper takes `tenantId` as its first argument
- Admin-only pages check `orgRole` server-side
- Webhook routes verify signatures, not JWT auth

## Related
- [Task 006 — Authentication](../../../roadmap/tasks/006-auth.md)
- [Task 008 — Tenant Middleware](../../../roadmap/tasks/008-tenant-middleware.md)
- [tenant-security-auditor agent](../../agents/tenant-security-auditor.md)

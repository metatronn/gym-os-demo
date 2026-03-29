# Task 028: Internal Admin Panel

**Phase:** 6 — Growth
**Priority:** Low
**Depends on:** [007](./007-db-schema.md), [010](./010-stripe-setup.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Build an internal admin panel for the GYM OS team to view all tenants, monitor subscriptions, and manage the platform.

## Steps

### 1. Admin Route Protection

Create `src/app/admin/layout.tsx`:

- Check that the signed-in user's email matches an allowlist (e.g., `@gymos.app` domain)
- Or use a Clerk metadata flag: `publicMetadata.role === 'platform_admin'`
- Return 404 for non-admins (don't reveal the route exists)

### 2. Admin Dashboard

`src/app/admin/page.tsx`:

- **Total tenants** (count)
- **Active subscriptions** vs. trialing vs. canceled
- **MRR** (monthly recurring revenue — sum of active subscription prices)
- **New signups this week/month**
- **Recent activity** (new tenants, churned tenants, payment failures)

### 3. Tenant List

`src/app/admin/tenants/page.tsx`:

- Table of all tenants
- Columns: Name, Status, Plan, MRR, Members, Created, Last Active
- Click to view tenant detail
- Search and filter

### 4. Tenant Detail

`src/app/admin/tenants/[id]/page.tsx`:

- Tenant info (name, owner, contact)
- Subscription status + Stripe link
- Member count, lead count
- Activity log
- Impersonate button (via Clerk impersonation — carefully gated)

### 5. Metrics

- Cohort retention chart (what % of tenants are still active after 1, 3, 6 months)
- Revenue chart (MRR over time)
- Churn rate

## Acceptance Criteria

- Admin panel is inaccessible to regular users
- Tenant list shows all gyms with key metrics
- Subscription status is accurate and links to Stripe
- Basic platform metrics are visible
- No tenant data is modifiable from admin (read-only, except impersonation)

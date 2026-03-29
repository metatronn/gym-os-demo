# Task 022: Settings Page (Real Configuration)

**Phase:** 5 — Polish & Hardening
**Priority:** Medium
**Depends on:** [006](./006-auth.md), [008](./008-tenant-middleware.md), [010](./010-stripe-setup.md), [018](./018-slack-integration.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Wire the settings page to real data. Each tab should read from and write to the tenant's configuration in the database and connected services (Stripe, etc.).

## Steps

### 1. Gym Profile Tab

- Read/write tenant name, slug, logo from `tenants` table
- Save updates via server action → `db.update(tenants)`
- Slug is used for the public-facing URL (future feature)

### 2. Membership Plans Tab

- Display plans defined in Stripe (fetch from Stripe API)
- Link to Stripe Dashboard for plan management (don't rebuild plan CRUD — Stripe Dashboard is the source of truth)
- Show which plans are active, prices, trial periods

### 3. Notifications Tab

- Email notification preferences stored in `tenants.settings` JSON column:
  - Daily digest: on/off
  - Payment alerts: on/off
  - Lead notifications: on/off
  - At-risk alerts: on/off
- Save preferences via server action

### 4. Integrations Tab

- **Stripe:** Show connection status (has `stripeCustomerId`?), link to Stripe Dashboard
- **Slack:** Webhook URL input + test button (from Task 018)
- **Other integrations:** Show "Coming Soon" for Google Calendar, Zapier, etc.

### 5. Staff & Roles Tab

- Pull staff list from the `org_members` table
- Show name, role, email for each member
- "Invite Staff" button → invite flow via email (generates a sign-up link with org pre-selected)
- Role management via the `org_members` table (admin, coach, staff)
- Admin can change roles but not remove themselves

### 6. Security Tab

- Password change form (verify current password, set new one via bcrypt)
- Session management (list active JWT sessions)
- Activity log (recent sign-ins)

### 7. Admin-Only Access

The settings page should be gated to `org:admin` role:

```ts
// In settings page server component:
const { orgRole } = await requireAuth();
if (orgRole !== 'org:admin') {
  redirect('/dashboard');
}
```

Coaches and staff should not access settings.

## Acceptance Criteria

- Gym profile saves to database
- Notification preferences save to `tenants.settings`
- Staff list pulls from organization members in the database
- Slack webhook configuration works (from Task 018)
- Stripe status is displayed
- Settings page is admin-only
- All current UI tabs are functional (not just visual)

# Task 030: Multi-Location Architecture & Location Management

**Phase:** 7 — Migration & Multi-Location Foundations
**Priority:** Critical
**Depends on:** [007](./007-db-schema.md), [008](./008-tenant-middleware.md), [009](./009-onboarding-flow.md)
**Blocks:** [034](./034-marketing-automation.md), [037](./037-command-center-agents.md), [039](./039-knowledge-brand-memory.md), [040](./040-executive-dashboards-white-label.md), [042](./042-public-api-integrations.md), [043](./043-medical-fitness-readiness.md)

---

## Objective

Evolve tenancy from "one org = one gym" into the multi-location model described in the docs. One tenant should be able to run one or many locations with shared defaults, scoped permissions, and executive rollups.

## Steps

### 1. Schema Extensions

Add location-aware entities:

- `locations`
- `user_location_roles` or equivalent membership mapping
- `location_id` on classes, bookings, check-ins, leads, messages, workflows, and campaigns where appropriate
- org-level defaults plus location-level overrides for settings and brand rules

### 2. Permission Model

Introduce clear org/location scopes:

- tenant-wide owner/admin permissions
- location manager permissions
- staff permissions limited to assigned locations
- read-only/reporting roles

No user should be able to access another location's operational records unless their role explicitly allows it.

### 3. App UX

Add location-aware product behavior:

- location switcher in the authenticated app
- "all locations" vs specific location filters where role permits
- home location assignment during onboarding/invite flows
- location-aware breadcrumbs and page headers

### 4. Data Access Layer

Extend query helpers so they enforce:

- `tenant_id` on every query
- `location_id` filters where the entity is location-scoped
- role-aware overrides for org-wide views
- safe fallbacks for users with no assigned locations

### 5. Operational Defaults

Support org defaults with location overrides for:

- billing rules
- schedule templates
- waivers/forms
- campaign templates
- notification settings
- branding assets

### 6. Reporting Foundation

Prepare the app for future executive rollups:

- location comparison queries
- shared KPI definitions across locations
- ability to aggregate by location group or all locations

## Acceptance Criteria

- A tenant can have multiple locations
- Users can be scoped to one or many locations
- Location-aware queries are enforced in the data layer
- The app supports a location switcher and all-locations views where permitted
- Shared defaults with location overrides are represented in the schema
- Cross-location reporting foundations exist for later executive dashboards

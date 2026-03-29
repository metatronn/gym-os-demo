# Task 029: Import Assistant & Zero-Friction Migration

**Phase:** 7 — Migration & Multi-Location Foundations
**Priority:** Critical
**Depends on:** [007](./007-db-schema.md), [013](./013-members-crud.md), [014](./014-leads-pipeline.md), [015](./015-schedule-classes.md), [010](./010-stripe-setup.md)
**Blocks:** [041](./041-member-facing-ai-voice.md) (member continuity story), future launch readiness

---

## Objective

Build the migration wedge described in the product docs: switching into GYM OS should feel safe, guided, and fast. A gym should be able to upload real exports, map fields, review integrity issues, and launch without feeling like it is starting over.

## Steps

### 1. Import Data Model

Create import-specific tables and storage conventions:

- `import_jobs` — source system, tenant, uploaded file metadata, status, actor
- `import_mappings` — source field → target field mappings, confidence, overrides
- `import_rows` — per-row parse status, dedupe status, validation errors
- `import_conflicts` — billing conflicts, duplicate members, broken references
- object storage path for uploaded files and generated reports

Every import artifact must be tenant-scoped and auditable.

### 2. Supported Inputs (v1)

Support the practical formats owners actually have:

- CSV uploads
- Excel uploads
- known export templates from Mindbody, ClubReady, Glofox, Zen Planner, and similar systems
- adapter layer so future API-based imports can plug into the same pipeline

### 3. Guided Import Flow

Create a customer-facing wizard:

1. Upload export files
2. Detect source system or template shape
3. Auto-map columns with confidence scores
4. Let staff manually fix mappings
5. Run dry-run validation and integrity checks
6. Show summary totals before commit
7. Confirm import and create launch checklist

### 4. Data Domains That Must Transfer

The import scope needs to cover the docs-defined switching story:

- members and contact info
- lead records and source attribution
- membership status, plan, renewal dates
- billing history and invoice/payment history
- notes and tags
- attendance/check-in history
- class schedules and capacity
- staff profiles and assignments
- pricing rules, contracts, waivers, and forms where available
- payment token references where the source system and compliance boundaries allow it

### 5. Smart Import Rules

Add deterministic checks before write:

- duplicate detection by email, phone, and fuzzy name matches
- foreign-key integrity checks for classes, bookings, memberships, and staff
- contract and billing rule conflicts
- invalid date handling and timezone normalization
- idempotent reruns for repeated uploads

### 6. Dual-System Mode

Support a transitional launch mode for early customers:

- new leads and outreach can start in GYM OS immediately
- legacy memberships can remain source-of-truth temporarily
- show cutover status in admin/onboarding UI
- keep a migration checklist so operators know what is still pending

### 7. Concierge Migration Support

Add operator tooling for early white-glove onboarding:

- downloadable error reports
- import audit log
- mapping templates that can be saved and reused
- manual override queue for ambiguous records
- "re-run with fixes" flow instead of forcing a clean restart

## Acceptance Criteria

- Import wizard supports CSV and Excel uploads
- Auto-mapping works with manual override support
- Dry-run validation surfaces duplicates, missing fields, and billing conflicts before commit
- Imported totals are reviewed before data is written
- Members, leads, schedules, notes, and billing history can be brought over in v1
- Dual-system mode is supported for gradual cutover
- Every import is auditable and safe to retry

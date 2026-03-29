# Mock Data Status

**Last Updated:** 2026-03-29
**Confidence:** Medium (will change as features go live)

## Summary
The app currently uses hardcoded mock data in `src/lib/data.ts`. Each page will migrate from mock to real database data during Phase 3. The file should be deleted when all pages are migrated.

**Key Facts:**
- All mock data lives in `src/lib/data.ts`
- Types defined there: Member, Lead, ClassSession, Payment, Task, Message, ActivityEvent, DashboardKPIs
- Database schema (Task 007) mirrors these types with added `tenant_id`
- Seed script will populate test tenant with identical mock data

**File Pointer:** `src/lib/data.ts`

## Migration Plan
| Page | Mock Data Used | Migrated In |
|------|---------------|-------------|
| Dashboard | `dashboardKPIs`, `activityEvents` | Task 019 |
| Members | `members` | Task 013 |
| Leads | `leads` | Task 014 |
| Schedule | `classes` | Task 015 |
| Floor Plan | `classes` (subset) | Task 016 |
| Billing | `payments` | Task 012 |
| Tasks | `tasks` | Task 021 |
| Messages | `messages` | Task 021 |
| Reports | All aggregations | Task 025 |

## Related Topics
- [Multi-tenancy](../patterns/multi-tenancy.md)

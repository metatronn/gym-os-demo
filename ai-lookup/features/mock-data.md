# Mock Data Status

**Last Updated:** 2026-03-29
**Confidence:** Medium (will change as features go live)

## Summary
Most core pages now read from the database. The remaining live mock/demo content is concentrated in the reports page, the settings plans fallback, and the command center demo UI. Seed-only fixtures now live outside the app-facing reports fallback file.

**Key Facts:**
- `src/lib/data.ts` now only holds the reports fallback dataset: `members`, `leads`, `classes`, and `payments`
- Seed-only fixtures for `tasks`, `messages`, and `activityEvents` live in `src/db/seed-fixtures.ts`
- Dead settings mock staff/security data was removed; the only remaining settings mock is the plans fallback when Stripe is disabled
- The command center is still a demo surface with canned quick actions and static responses
- The file should still be deleted once reports are database-backed and shared types move elsewhere

**File Pointers:** `src/lib/data.ts`, `src/db/seed-fixtures.ts`, `src/components/CommandPanel.tsx`

## Migration Plan
| Page | Mock Data Used | Migrated In |
|------|---------------|-------------|
| Dashboard | None in runtime; seed fixtures remain for local dev | Task 019 complete |
| Members | None in runtime | Task 013 complete |
| Leads | None in runtime | Task 014 complete |
| Schedule | None in runtime | Task 015 complete |
| Floor Plan | None in runtime; visual layout is static config, not mock records | Task 016 complete |
| Billing | None in runtime | Task 012 complete |
| Tasks | None in runtime; local seed fixtures remain | Task 021 complete |
| Messages | None in runtime; local seed fixtures remain | Task 021 complete |
| Settings | `mockPlans` fallback when Stripe is disabled | Task 022 partial |
| Reports | `members`, `leads`, `payments`, `classes` via `buildReportData()` | Task 025 |
| Command Center | Static quick actions, canned responses, fake delays/voice input | Task 037 |

## Related Topics
- [Multi-tenancy](../patterns/multi-tenancy.md)

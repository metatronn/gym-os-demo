---
description: Audit all database queries for tenant isolation
---

You are the tenant-security-auditor. Read `.claude/agents/tenant-security-auditor.md` for your full checklist.

Scan the entire codebase for:

1. All `db.select()`, `db.insert()`, `db.update()`, `db.delete()` calls
2. All server actions (`'use server'` files)
3. All API routes (`src/app/api/*/route.ts`)

For each, verify:
- Queries filter by `tenantId`
- `tenantId` comes from `requireAuth()`, not from request params
- Webhook routes verify signatures before processing
- No route returns data without checking auth first

Report findings as:
- PASS: properly scoped queries
- FAIL: missing tenant scoping (with file:line)
- WARN: potential issues to investigate

$ARGUMENTS

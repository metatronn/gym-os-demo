# Task 005: Neon Database & Drizzle ORM Setup

**Phase:** 1 — Foundation
**Priority:** Critical
**Depends on:** [003](./003-environment-secrets.md)
**Blocks:** [007](./007-db-schema.md), [008](./008-tenant-middleware.md)

---

## Objective

Set up Neon Postgres with Drizzle ORM, connection pooling, and a migration workflow that runs safely in CI and production.

## Steps

### 1. Install Dependencies

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

### 2. Create Neon Project

1. Sign in to [neon.tech](https://neon.tech)
2. Create project `gym-os-prod` in **US East (Ohio)** (matches Vercel `iad1`)
3. Default branch = `main` (production)
4. Create branch `development` from `main`
5. Install the **Neon Vercel Integration** (auto-manages preview branch env vars)

### 3. Drizzle Configuration

Create `drizzle.config.ts` at project root:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
```

**Why `DATABASE_URL_UNPOOLED`?** Migrations need a direct connection, not a pooled one. Pooled connections can't run DDL reliably.

### 4. Database Client

Create `src/db/index.ts`:

```ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
export type Database = typeof db;
```

**Why `neon-http` driver?** Neon's HTTP driver is optimized for serverless — one query per request, no persistent connection needed. Faster cold starts than WebSocket driver.

### 5. Migration Workflow

Add scripts to `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

**Development workflow:**
1. Edit schema files
2. Run `npm run db:generate` to create migration SQL files
3. Run `npm run db:migrate` to apply to dev database
4. Commit migration files alongside schema changes

**Production workflow:**
Migrations run automatically in CI (added in a later task) or manually via `npm run db:migrate` with `DATABASE_URL_UNPOOLED` pointed at prod.

### 6. Drizzle Studio

`npm run db:studio` launches a local UI to browse and edit database contents. Useful for development and debugging.

### 7. Verify Connection

Create a simple health check API route to verify the connection works:

`src/app/api/health/route.ts`:

```ts
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1 as ok`);
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 });
  }
}
```

## File Structure After This Task

```
src/
  db/
    index.ts          # Database client (drizzle + neon)
    schema/
      index.ts        # Re-exports all schema files (empty for now)
drizzle/              # Generated migration files (committed)
drizzle.config.ts     # Drizzle Kit configuration
```

## Acceptance Criteria

- `@neondatabase/serverless` and `drizzle-orm` are installed
- `src/db/index.ts` exports a typed `db` client
- `drizzle.config.ts` is configured and points to schema directory
- Migration scripts work: `db:generate`, `db:migrate`, `db:push`
- `/api/health` returns `{ status: 'ok', db: 'connected' }` when deployed
- Both pooled (`DATABASE_URL`) and unpooled (`DATABASE_URL_UNPOOLED`) connections are configured

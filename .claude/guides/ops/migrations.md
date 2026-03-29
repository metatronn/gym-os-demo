# Database Migrations

**When to use:** Adding or modifying database schema.

## Workflow

```bash
# 1. Edit schema files in src/db/schema/*.ts
# 2. Generate migration SQL
npm run db:generate

# 3. Review the generated SQL in drizzle/
# 4. Apply to development database
npm run db:migrate

# 5. Commit both schema changes AND migration files
git add src/db/schema/ drizzle/
git commit -m "Add bookings table"
```

## Commands

| Command | What it does | When to use |
|---------|-------------|-------------|
| `db:generate` | Creates SQL migration from schema diff | After editing schema files |
| `db:migrate` | Applies pending migrations | After generating, or on fresh DB |
| `db:push` | Pushes schema directly (no migration file) | Development only, quick iteration |
| `db:studio` | Opens DB browser | Debugging, manual inspection |

## Rules

- **NEVER edit committed migration files.** If a migration is wrong, create a new one that fixes it.
- **ALWAYS commit migration files** alongside schema changes. They're code.
- **ALWAYS review generated SQL** before applying. Drizzle can generate destructive migrations (DROP COLUMN) if you rename things.
- **Production migrations** must be backwards-compatible with running code. Deploy migration first, then code.

## Adding a New Table

1. Create `src/db/schema/{entity}.ts`
2. Add `tenantId` column with foreign key to `tenants`
3. Add index on `tenantId`
4. Re-export from `src/db/schema/index.ts`
5. Generate and apply migration

## Troubleshooting

### Migration fails with "relation already exists"
The migration was partially applied. Check what exists in the DB via `db:studio`, then create a corrective migration.

### Schema drift between environments
Use `db:push` to force-sync development. For production, always use `db:migrate` with committed migration files.

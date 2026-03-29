# Deploying

**When to use:** Understanding how deploys work, troubleshooting failed deploys.

## How Deploys Work

Vercel handles deployment automatically:

| Trigger | Deploy Type | Target |
|---------|-------------|--------|
| Push to `main` | Production deploy | `gym-os-demo.vercel.app` |
| Open/update PR | Preview deploy | Unique URL per PR |

## Production Deploy

1. Merge PR to `main` (requires CI pass + approval)
2. Vercel auto-builds and deploys
3. Zero-downtime — Vercel serves old version until new build is ready

## Preview Deploys

Every PR gets a preview URL. Vercel comments the URL on the PR. Preview deploys use:
- Development-scoped env vars
- Neon development database branch (via Neon-Vercel integration)
- Stripe test mode keys

## Database Migrations in Production

Migrations must be applied separately from code deploys:

```bash
# Set DATABASE_URL_UNPOOLED to production connection string
DATABASE_URL_UNPOOLED="postgresql://..." npm run db:migrate
```

**Rule:** Migrations must be backwards-compatible with the currently running code. Deploy migration first, then deploy code that uses it.

## Rollback

Vercel instant rollback: Dashboard → Deployments → click any previous deploy → "Promote to Production"

## Troubleshooting

### Build fails in Vercel
Check the build logs in Vercel Dashboard. Common causes:
- Missing env var (add in Vercel → Settings → Environment Variables)
- Type error not caught locally (run `npx tsc --noEmit` locally)
- `npm ci` fails (check `package-lock.json` is committed)

### Preview deploy has wrong data
Check that the Neon-Vercel integration is creating branches correctly. Each preview should get its own DB branch.

## Related
- [Secrets management](./secrets.md)
- [Database migrations](./migrations.md)

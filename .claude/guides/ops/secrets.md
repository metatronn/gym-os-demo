# Secrets & Environment Variables

**When to use:** Adding, changing, or debugging environment variables.

## Where Secrets Live

| Environment | Source | How to update |
|-------------|--------|---------------|
| **Local dev** | `.env.local` | Edit directly (not committed) |
| **Preview** | Vercel env vars (Preview scope) | Vercel Dashboard or `vercel env add` |
| **Production** | Vercel env vars (Production scope) | Vercel Dashboard or `vercel env add` |

## Adding a New Secret

1. Add to `.env.example` with empty value and comment
2. Add to `src/lib/env.ts` as `requireEnv()` or `optionalEnv()`
3. Set in Vercel Dashboard for all environments
4. Set in local `.env.local`
5. If CI needs it, add stub to `.github/workflows/ci.yml` env block

## Scoping

Vercel env vars have three scopes: Production, Preview, Development. Set each appropriately:

- **Stripe keys:** `sk_live_*` for Production, `sk_test_*` for Preview/Development
- **Clerk keys:** Live keys for Production, test keys for Preview/Development
- **Database:** Neon production branch for Production, dev branch for Preview/Development (auto-managed by Neon integration)

## Rules

- NEVER prefix server-only secrets with `NEXT_PUBLIC_`
- NEVER commit `.env.local` or any file with real secrets
- NEVER hardcode secrets in source code
- ALWAYS validate required secrets at startup via `src/lib/env.ts`

## Pulling Secrets from Vercel

```bash
vercel env pull .env.local  # Pulls Development-scoped vars
```

## Full Variable Reference

See [NEEDS.md](../../../NEEDS.md) → "Complete Environment Variable Reference"

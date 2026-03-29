# Task 004: CI Pipeline (GitHub Actions)

**Phase:** 0 — Infrastructure & CI/CD
**Priority:** Critical
**Depends on:** [002](./002-vercel-project-setup.md)
**Blocks:** [001](./001-github-branch-protection.md) (status check name needed for branch protection)

---

## Objective

Every PR gets a CI check that builds, lints, and type-checks before it can merge. Keep it fast — under 2 minutes.

## Steps

### 1. Create `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Build & Lint
    runs-on: ubuntu-latest
    timeout-minutes: 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          # Stub env vars so the build doesn't fail on missing secrets
          # These are NOT real values — just enough to pass the build step
          DATABASE_URL: "postgresql://stub:stub@localhost:5432/stub"
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_stub"
          CLERK_SECRET_KEY: "sk_test_stub"
```

### 2. Key Design Decisions

**Why not Vercel's built-in checks?**
Vercel's preview deploy is a check, but it doesn't run linting or type-checking independently. We want those to gate PRs even if the build "succeeds" with warnings.

**Why stub env vars in CI?**
The build step (`next build`) may import server-side code that reads `process.env`. We stub just enough to let the build pass. The `env.ts` validation (Task 003) only throws at runtime, not at build time.

**Why `npm ci` instead of `npm install`?**
`npm ci` is deterministic — it installs exactly what's in `package-lock.json`. Faster and more reliable in CI.

### 3. Add Status Check to Branch Protection

Once the first CI run completes, go back to GitHub branch protection (Task 001) and add the `Build & Lint` check as a required status check.

### 4. Future CI Additions (Not Now)

These will be added in later phases as we add tests and DB:

- `npm test` — once we have tests (Phase 5+)
- Database migration dry-run — once we have Drizzle migrations
- Playwright E2E — much later, once core flows are stable

## Acceptance Criteria

- Every PR to `main` runs the CI workflow
- CI runs: install → type-check → lint → build
- CI completes in under 2 minutes
- Branch protection requires this check to pass
- Pushes to `main` also trigger CI (for post-merge validation)

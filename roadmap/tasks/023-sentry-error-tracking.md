# Task 023: Sentry Error Tracking

**Phase:** 5 — Polish & Hardening
**Priority:** High
**Depends on:** [002](./002-vercel-project-setup.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Set up Sentry for error tracking and performance monitoring. Every unhandled error should be captured with context (tenant ID, user ID, route).

## Steps

### 1. Install & Configure

```bash
npx @sentry/wizard@latest -i nextjs
```

This automatically:
- Installs `@sentry/nextjs`
- Creates `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Updates `next.config.mjs` to wrap with Sentry
- Creates `src/app/global-error.tsx`

### 2. Configuration

In `sentry.server.config.ts`:

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,           // 10% of requests for performance
  environment: process.env.VERCEL_ENV ?? 'development',
});
```

### 3. Add Tenant Context

In the middleware or a server-side utility, tag Sentry with the current tenant:

```ts
import * as Sentry from '@sentry/nextjs';

// After auth in API routes / server components:
Sentry.setUser({ id: userId });
Sentry.setTag('tenant_id', orgId);
```

### 4. Source Maps

Sentry's Next.js wizard handles source map upload automatically via the Sentry Vercel integration. Verify it works by checking that stack traces in Sentry show original TypeScript source.

### 5. Alert Rules

In Sentry Dashboard:
- Alert on first occurrence of new issues
- Alert on spike (> 10 events in 5 minutes)
- Send alerts to Slack (your internal channel) or email

## Acceptance Criteria

- Sentry captures unhandled errors in both client and server
- Stack traces show original TypeScript source
- Errors are tagged with `tenant_id` and user ID
- Environment is set correctly (production, preview, development)
- Alert rules notify the team of new issues

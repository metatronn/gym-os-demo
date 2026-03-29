# Task 002: Vercel Project Setup & Configuration

**Phase:** 0 — Infrastructure & CI/CD
**Priority:** Critical
**Depends on:** [001](./001-github-branch-protection.md)
**Blocks:** [003](./003-environment-secrets.md), [004](./004-ci-pipeline.md)

---

## Objective

Properly configure the Vercel project with correct settings, preview deploys, and production domain. The current deploy was done ad-hoc — formalize it.

## Steps

### 1. Vercel Project Configuration

In Vercel Dashboard → Project Settings:

- **General**
  - Project Name: `gym-os-demo` (or `gym-os` for production)
  - Framework Preset: Next.js
  - Node.js Version: 20.x
  - Build Command: `next build` (default)
  - Install Command: `npm ci` (not `npm install` — deterministic)

- **Git**
  - Connected Repository: `metatronn/gym-os-demo`
  - Production Branch: `main`
  - Enable preview deploys for all branches

- **Functions**
  - Region: `iad1` (US East — closest to Neon default region)
  - Max Duration: 10s (default, increase later if needed for Inngest)

### 2. Preview Deploy Settings

- Enable **Comment on PR** — Vercel will post deploy preview URLs on every PR
- Enable **Protection Bypass for Automation** — needed for CI to check preview deploys
- Set Preview environment to use development database branch (configured in Task 003)

### 3. Custom Domain (When Ready)

- Add `app.gymos.app` (or chosen domain) as production domain
- Vercel provides the DNS records — add them at your registrar
- Enable **Redirect www to non-www** (or vice versa)

### 4. Vercel Speed Insights

- Enable Speed Insights in project settings (free on Pro plan)
- This gives Core Web Vitals monitoring out of the box

### 5. Update next.config.mjs

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',  // Clerk user avatars
      },
    ],
  },
};

export default nextConfig;
```

## Acceptance Criteria

- Vercel project is connected to `metatronn/gym-os-demo`
- Pushes to `main` trigger production deploys
- PRs get preview deploys with comment links
- Install command uses `npm ci`
- Function region is set to `iad1`

# GYM OS — Account & Configuration Needs

Everything you need to sign up for, configure, and wire together before the first line of production code runs.

---

## 1. Vercel (Hosting & Deployment)

| Field | Value |
|-------|-------|
| **Service** | [vercel.com](https://vercel.com) |
| **Plan needed** | Pro ($20/mo) — needed for team access, preview protection, and analytics |
| **Account** | Create or use existing Vercel team account |
| **Actions** | Link the `metatronn/gym-os-demo` GitHub repo as a Vercel project |

### Configuration
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Node.js Version:** 18.x or 20.x
- **Root Directory:** `/` (default)

### Environment Variables to Set in Vercel Dashboard
All secrets below will be added here. Vercel environment variables support `Production`, `Preview`, and `Development` scopes — set all three unless noted.

---

## 2. Neon (PostgreSQL Database)

| Field | Value |
|-------|-------|
| **Service** | [neon.tech](https://neon.tech) |
| **Plan needed** | Free tier to start (0.5 GB storage, autoscaling) |
| **Account** | Sign up with GitHub SSO |

### Setup Steps
1. Create a new project (e.g., `gym-os-prod`)
2. Create a `production` branch (this is your main DB branch)
3. Create a `development` branch (for local dev and preview deploys)
4. Note the connection strings for each branch

### Secrets Produced
```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Vercel Integration (Recommended)
Install the **Neon Vercel Integration** from the Vercel marketplace — it automatically:
- Sets `DATABASE_URL` and `DATABASE_URL_UNPOOLED` env vars
- Creates a Neon branch per Vercel preview deploy
- Cleans up branches when preview deploys are deleted

---

## 3. Clerk (Authentication & Multi-Tenancy)

| Field | Value |
|-------|-------|
| **Service** | [clerk.com](https://clerk.com) |
| **Plan needed** | Free tier (10,000 MAU) to start |
| **Account** | Sign up, create an application |

### Setup Steps
1. Create a Clerk application (e.g., `GYM OS`)
2. Enable **Organizations** (this is how we model tenants / gyms)
3. Configure sign-in methods: Email + Password, Google OAuth
4. Set up redirect URLs:
   - **Production:** `https://gym-os-demo.vercel.app/dashboard`
   - **Development:** `http://localhost:3000/dashboard`
5. Note the API keys from the Clerk dashboard

### Secrets Produced
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

### Clerk Organization = Gym Tenant
Each gym that signs up creates a Clerk Organization. All data is scoped to the org ID (`orgId`). Staff members are organization members with roles (`admin`, `coach`, `staff`).

---

## 4. Stripe (Payments & Subscriptions)

| Field | Value |
|-------|-------|
| **Service** | [stripe.com](https://stripe.com) |
| **Plan needed** | Standard (2.9% + 30c per transaction, no monthly fee) |
| **Account** | Full business account with bank details for payouts |

### Setup Steps
1. Complete business verification in Stripe Dashboard
2. Create **Products** in Stripe:
   - `GYM OS Pro` — $149/mo (or whatever pricing)
   - `GYM OS Trial` — $0 with 14-day free trial period on Pro
3. Create a **Customer Portal** configuration (for self-serve billing management)
4. Set up **Webhook Endpoint**:
   - URL: `https://gym-os-demo.vercel.app/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `customer.created`
5. Note the webhook signing secret

### Secrets Produced
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_TRIAL=price_xxxxx
```

### Test Mode
Use Stripe test mode during development. All keys have `_test_` variants that work identically but don't move real money.

---

## 5. Resend (Transactional Email)

| Field | Value |
|-------|-------|
| **Service** | [resend.com](https://resend.com) |
| **Plan needed** | Free tier (100 emails/day, 3,000/mo) |
| **Account** | Sign up with GitHub SSO |

### Setup Steps
1. Create an API key
2. **Verify a sending domain** (e.g., `mail.gymos.app` or `notifications.gymos.app`):
   - Add the DNS records Resend provides (DKIM, SPF, DMARC)
   - Until domain is verified, you can send from `onboarding@resend.dev` for testing
3. Optionally set up a custom reply-to address

### Secrets Produced
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=GYM OS <notifications@gymos.app>
```

---

## 6. Slack (Outbound Webhooks)

| Field | Value |
|-------|-------|
| **Service** | [api.slack.com](https://api.slack.com) |
| **Plan needed** | Free (Incoming Webhooks are free) |
| **Setup** | Per-tenant, configured in GYM OS settings page |

### How It Works
This is NOT an app-level Slack integration. Each gym tenant configures their own Slack Incoming Webhook URL in their GYM OS settings page. We store the URL in their tenant record and POST to it when events occur.

### No Global Secrets Needed
Webhook URLs are stored per-tenant in the database, not as environment variables.

### Internal Slack (Optional)
For your own team notifications (error alerts, new signups):
```
INTERNAL_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxxxx
```

---

## 7. Inngest (Background Jobs)

| Field | Value |
|-------|-------|
| **Service** | [inngest.com](https://inngest.com) |
| **Plan needed** | Free tier (unlimited local dev, 5,000 runs/mo in cloud) |
| **Account** | Sign up with GitHub SSO |

### Setup Steps
1. Create an Inngest account and note the signing key
2. The Inngest route is served from `/api/inngest` in the Next.js app
3. Inngest auto-discovers functions when the route is deployed

### Secrets Produced
```
INNGEST_SIGNING_KEY=signkey-xxxxx
INNGEST_EVENT_KEY=xxxxx
```

### Jobs We'll Run
- Trial expiration check (daily cron)
- Payment failure follow-up emails
- Welcome email sequences
- Slack notification dispatch
- Daily digest emails

---

## 8. Sentry (Error Tracking)

| Field | Value |
|-------|-------|
| **Service** | [sentry.io](https://sentry.io) |
| **Plan needed** | Developer (free, 5,000 events/mo) |
| **Account** | Sign up, create a Next.js project |

### Secrets Produced
```
SENTRY_DSN=https://xxxxx@oXXXXXX.ingest.sentry.io/XXXXXXX
SENTRY_AUTH_TOKEN=sntrys_xxxxx
SENTRY_ORG=your-org
SENTRY_PROJECT=gym-os
```

---

## 9. PostHog (Analytics & Feature Flags) — Phase 2

| Field | Value |
|-------|-------|
| **Service** | [posthog.com](https://posthog.com) |
| **Plan needed** | Free tier (1M events/mo) |
| **Setup** | Create project, get API key |

### Secrets Produced
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Complete Environment Variable Reference

Copy this to `.env.local` for development. Fill in real values from each service.

```env
# ── Database (Neon) ──
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# ── Auth (Clerk) ──
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ── Payments (Stripe) ──
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_TRIAL=

# ── Email (Resend) ──
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# ── Background Jobs (Inngest) ──
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=

# ── Error Tracking (Sentry) ──
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# ── Analytics (PostHog) ──
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# ── Internal (Optional) ──
INTERNAL_SLACK_WEBHOOK_URL=
```

---

## Domain & DNS — Cloudflare

| Field | Value |
|-------|-------|
| **Service** | [cloudflare.com](https://cloudflare.com) |
| **Plan needed** | Free tier (DNS management is free) |
| **Account** | Create or use existing Cloudflare account |

### Setup Steps
1. **Purchase the domain** through Cloudflare Registrar (at-cost pricing, no markup)
   - Go to Cloudflare Dashboard → Domain Registration → Register Domains
   - Search for `gymos.app` (or your preferred domain) and purchase
   - Cloudflare Registrar charges wholesale ICANN prices with no renewal markup
2. **DNS is automatically managed** since the domain is registered with Cloudflare — no nameserver migration needed
3. **Add Vercel DNS records:**
   - `app` → CNAME → `cname.vercel-dns.com` (set DNS-only / gray cloud, not proxied)
   - Vercel requires DNS-only mode for its SSL provisioning to work
4. **Add Resend sending domain records** (DKIM, SPF, DMARC) for `mail.gymos.app` or `notifications.gymos.app`
5. **Add it in Vercel** project settings → Domains → `app.gymos.app`
6. **Update Clerk** redirect URLs to use the new domain
7. **Update Stripe** webhook URL to use the new domain

### Why Cloudflare
- **At-cost domain pricing** — no registrar markup, no surprise renewal hikes
- **Free DNS** with fast global anycast resolution
- **Single pane of glass** for domain + DNS — no separate registrar to manage
- **DDoS protection and analytics** included on the free tier
- **Easy DNS record management** for Vercel, Resend, and any future services

### Cloudflare DNS Settings Notes
- **Proxy status:** Set Vercel CNAME records to **DNS-only** (gray cloud), not **Proxied** (orange cloud). Vercel handles its own SSL and CDN — proxying through Cloudflare causes certificate conflicts.
- **Resend records:** DKIM/SPF/DMARC records are TXT records and are always DNS-only.
- **TTL:** Auto (default) is fine for all records.

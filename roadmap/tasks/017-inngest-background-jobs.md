# Task 017: Inngest Background Jobs

**Phase:** 4 — Email, Notifications & Jobs
**Priority:** High
**Depends on:** [011](./011-stripe-webhooks.md)
**Blocks:** [018](./018-slack-integration.md), [020](./020-resend-email.md)

---

## Objective

Set up Inngest for background job processing. These are jobs that shouldn't block a request: sending emails, Slack notifications, trial expiration checks, and payment failure follow-ups.

## Steps

### 1. Install Dependencies

```bash
npm install inngest
```

### 2. Inngest Client

Create `src/lib/inngest.ts`:

```ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'gym-os',
});
```

### 3. Inngest API Route

Create `src/app/api/inngest/route.ts`:

```ts
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { trialExpirationCheck } from '@/jobs/trial-expiration';
import { sendWelcomeEmail } from '@/jobs/welcome-email';
import { paymentFailedFollowUp } from '@/jobs/payment-failed';
import { slackNotification } from '@/jobs/slack-notification';
import { dailyDigest } from '@/jobs/daily-digest';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    trialExpirationCheck,
    sendWelcomeEmail,
    paymentFailedFollowUp,
    slackNotification,
    dailyDigest,
  ],
});
```

### 4. Job Definitions

#### Trial Expiration Check (Cron)

`src/jobs/trial-expiration.ts`:

```ts
import { inngest } from '@/lib/inngest';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';

export const trialExpirationCheck = inngest.createFunction(
  { id: 'trial-expiration-check' },
  { cron: '0 9 * * *' },  // Every day at 9am UTC
  async ({ step }) => {
    // Find tenants with expiring trials (3 days out, 1 day out, and expired)
    const expiringTrials = await step.run('find-expiring', async () => {
      const now = new Date();
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      return db.select()
        .from(tenants)
        .where(and(
          eq(tenants.subscriptionStatus, 'trialing'),
          lt(tenants.trialEndsAt, threeDays),
        ));
    });

    // Send appropriate emails for each
    for (const tenant of expiringTrials) {
      const daysLeft = Math.ceil(
        (tenant.trialEndsAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysLeft <= 0) {
        // Trial expired — lock the account
        await step.run(`expire-${tenant.id}`, async () => {
          await db.update(tenants)
            .set({ subscriptionStatus: 'canceled' })
            .where(eq(tenants.id, tenant.id));
        });

        await step.sendEvent('send-trial-expired-email', {
          name: 'email/trial-expired',
          data: { tenantId: tenant.id },
        });
      } else if (daysLeft <= 3) {
        await step.sendEvent(`trial-warning-${tenant.id}`, {
          name: 'email/trial-expiring',
          data: { tenantId: tenant.id, daysLeft },
        });
      }
    }
  },
);
```

#### Welcome Email Job

`src/jobs/welcome-email.ts`:

```ts
export const sendWelcomeEmail = inngest.createFunction(
  { id: 'send-welcome-email' },
  { event: 'tenant/created' },
  async ({ event, step }) => {
    // Send welcome email via Resend (Task 020)
    // event.data contains { tenantId, ownerEmail, gymName }
  },
);
```

#### Payment Failed Follow-Up

`src/jobs/payment-failed.ts`:

```ts
export const paymentFailedFollowUp = inngest.createFunction(
  { id: 'payment-failed-follow-up' },
  { event: 'billing/payment-failed' },
  async ({ event, step }) => {
    // Immediate: send "payment failed" email
    await step.run('send-failed-email', async () => {
      // Resend email (Task 020)
    });

    // Wait 3 days
    await step.sleep('wait-3-days', '3 days');

    // Check if payment was retried successfully
    const stillFailed = await step.run('check-status', async () => {
      // Query tenant subscription status
      return true; // placeholder
    });

    if (stillFailed) {
      // Send follow-up email
      await step.run('send-followup-email', async () => {
        // More urgent email
      });

      // Wait 4 more days (7 total)
      await step.sleep('wait-4-more-days', '4 days');

      // Final check — if still failed, send cancellation warning
      await step.run('send-final-warning', async () => {
        // "Your subscription will be canceled in 3 days"
      });
    }
  },
);
```

#### Slack Notification Job

`src/jobs/slack-notification.ts`:

```ts
export const slackNotification = inngest.createFunction(
  { id: 'slack-notification' },
  { event: 'notification/slack' },
  async ({ event, step }) => {
    // event.data: { tenantId, message, blocks? }
    // Fetch tenant's Slack webhook URL from DB
    // POST to it (Task 018)
  },
);
```

#### Daily Digest

`src/jobs/daily-digest.ts`:

```ts
export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 7 * * *' },  // 7am UTC daily
  async ({ step }) => {
    // For each active tenant:
    // 1. Gather yesterday's stats (new leads, check-ins, payments, at-risk)
    // 2. Send email digest via Resend
    // 3. Send Slack summary (if configured)
  },
);
```

### 5. Triggering Jobs from App Code

From webhook handlers and server actions, fire Inngest events:

```ts
import { inngest } from '@/lib/inngest';

// After tenant creation (in Clerk webhook):
await inngest.send({
  name: 'tenant/created',
  data: { tenantId: org.id, ownerEmail: '...', gymName: org.name },
});

// After payment failure (in Stripe webhook):
await inngest.send({
  name: 'billing/payment-failed',
  data: { tenantId, invoiceId },
});
```

### 6. Local Development

```bash
# Run Inngest dev server alongside Next.js:
npx inngest-cli dev
```

This gives you a local dashboard at `http://localhost:8288` to see job runs, replay events, and debug.

## File Structure After This Task

```
src/
  lib/
    inngest.ts          # Inngest client
  jobs/
    trial-expiration.ts
    welcome-email.ts
    payment-failed.ts
    slack-notification.ts
    daily-digest.ts
  app/
    api/
      inngest/
        route.ts        # Inngest serve endpoint
```

## Acceptance Criteria

- Inngest client and API route are set up
- Trial expiration cron runs daily and locks expired tenants
- Payment failure triggers a multi-step dunning sequence
- Welcome email is sent asynchronously after org creation
- Daily digest job runs for all active tenants
- All jobs are testable locally via `inngest-cli dev`
- Jobs can be triggered from webhooks and server actions

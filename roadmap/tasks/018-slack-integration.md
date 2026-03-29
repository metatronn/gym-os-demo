# Task 018: Slack Webhook Integration

**Phase:** 4 — Email, Notifications & Jobs
**Priority:** Medium
**Depends on:** [017](./017-inngest-background-jobs.md), [008](./008-tenant-middleware.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Let each gym configure a Slack Incoming Webhook URL in their settings. Fire notifications to that webhook when important events happen (new lead, payment received, payment failed, member at risk).

## Steps

### 1. Slack Notification Helper

Create `src/lib/slack.ts`:

```ts
interface SlackMessage {
  text: string;
  blocks?: any[];  // Slack Block Kit blocks for rich formatting
}

export async function sendSlackNotification(webhookUrl: string, message: SlackMessage) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    console.error('Slack notification failed:', response.status);
  }
}
```

### 2. Rich Message Templates

Create `src/lib/slack-templates.ts`:

```ts
export function newLeadMessage(leadName: string, source: string) {
  return {
    text: `New lead: ${leadName} from ${source}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:wave: *New Lead*\n*${leadName}* just came in from *${source}*`,
        },
      },
    ],
  };
}

export function paymentReceivedMessage(memberName: string, amount: number) {
  return {
    text: `Payment received: $${amount} from ${memberName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:white_check_mark: *Payment Received*\n*${memberName}* — $${amount.toFixed(2)}`,
        },
      },
    ],
  };
}

export function paymentFailedMessage(memberName: string, amount: number) {
  return {
    text: `Payment FAILED: $${amount} from ${memberName}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:x: *Payment Failed*\n*${memberName}* — $${amount.toFixed(2)}\nStripe will retry automatically.`,
        },
      },
    ],
  };
}

export function memberAtRiskMessage(memberName: string, riskLevel: string, reason: string) {
  return {
    text: `At-risk member: ${memberName} (${riskLevel})`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:warning: *At-Risk Member*\n*${memberName}* — Risk: *${riskLevel}*\n${reason}`,
        },
      },
    ],
  };
}

export function dailyDigestMessage(stats: {
  newLeads: number;
  checkIns: number;
  revenue: number;
  atRisk: number;
}) {
  return {
    text: `Daily Digest: ${stats.checkIns} check-ins, ${stats.newLeads} new leads`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'Daily Gym Digest' },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `:muscle: *Check-ins:* ${stats.checkIns}` },
          { type: 'mrkdwn', text: `:wave: *New Leads:* ${stats.newLeads}` },
          { type: 'mrkdwn', text: `:moneybag: *Revenue:* $${stats.revenue.toFixed(2)}` },
          { type: 'mrkdwn', text: `:warning: *At Risk:* ${stats.atRisk}` },
        ],
      },
    ],
  };
}
```

### 3. Settings Page: Slack Configuration

Add a Slack webhook URL input to the Settings → Integrations tab:

```tsx
// In the integrations section of settings page
<div>
  <label>Slack Webhook URL</label>
  <input
    type="url"
    placeholder="https://hooks.slack.com/services/T.../B.../..."
    value={slackWebhookUrl}
    onChange={...}
  />
  <button onClick={testSlackWebhook}>Test Connection</button>
</div>
```

Server action to save and test:

```ts
'use server';

export async function saveSlackWebhook(url: string) {
  const { orgId } = await requireAuth();
  await db.update(tenants)
    .set({ slackWebhookUrl: url })
    .where(eq(tenants.id, orgId));
}

export async function testSlackWebhook() {
  const { orgId } = await requireAuth();
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, orgId));

  if (!tenant.slackWebhookUrl) return { success: false };

  await sendSlackNotification(tenant.slackWebhookUrl, {
    text: 'GYM OS connected successfully!',
  });

  return { success: true };
}
```

### 4. Wire Into Inngest Job

The `slack-notification` Inngest job (Task 017) does the actual sending:

```ts
export const slackNotification = inngest.createFunction(
  { id: 'slack-notification' },
  { event: 'notification/slack' },
  async ({ event }) => {
    const { tenantId, message } = event.data;

    const [tenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant.slackWebhookUrl) return;  // Slack not configured — skip

    await sendSlackNotification(tenant.slackWebhookUrl, message);
  },
);
```

### 5. Fire Events From Key Flows

Anywhere an important event happens, fire the Inngest event:

```ts
// In leads server action:
await inngest.send({
  name: 'notification/slack',
  data: {
    tenantId: orgId,
    message: newLeadMessage(lead.name, lead.source),
  },
});
```

## Acceptance Criteria

- Gym owner can enter their Slack webhook URL in Settings
- "Test Connection" sends a test message to their Slack
- New lead → Slack notification
- Payment received → Slack notification
- Payment failed → Slack notification
- Daily digest → Slack summary
- No crash if Slack is not configured (graceful skip)

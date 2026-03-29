# Task 020: Resend Transactional Email

**Phase:** 4 — Email, Notifications & Jobs
**Priority:** High
**Depends on:** [017](./017-inngest-background-jobs.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Set up Resend with React Email templates for all transactional emails: welcome, trial expiring, payment failed, daily digest, and member notifications.

## Steps

### 1. Install Dependencies

```bash
npm install resend @react-email/components
npm install -D react-email
```

### 2. Resend Client

Create `src/lib/resend.ts`:

```ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'GYM OS <onboarding@resend.dev>';
```

### 3. Email Templates

Create `src/emails/` directory with React Email templates:

#### `src/emails/welcome.tsx`

```tsx
import { Html, Head, Body, Container, Heading, Text, Button, Section } from '@react-email/components';

interface WelcomeEmailProps {
  gymName: string;
  ownerName: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({ gymName, ownerName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#0A0F1C', color: '#F1F5F9', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
          <Heading style={{ color: '#F1F5F9' }}>
            Welcome to GYM OS
          </Heading>
          <Text>
            Hey {ownerName}, your gym <strong>{gymName}</strong> is now set up with a 14-day free trial.
          </Text>
          <Text>Here's what you can do right away:</Text>
          <Text>
            • Add your members and leads<br />
            • Set up your class schedule<br />
            • Configure your floor plan<br />
            • Invite your coaching staff
          </Text>
          <Section style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button
              href={dashboardUrl}
              style={{
                backgroundColor: '#0350FF',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Go to Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

#### `src/emails/trial-expiring.tsx`

```tsx
// Props: gymName, daysLeft, upgradeUrl
// Content: "Your trial expires in X days. Upgrade to keep your data."
// CTA: "Upgrade Now" → billing page
```

#### `src/emails/trial-expired.tsx`

```tsx
// Props: gymName, upgradeUrl
// Content: "Your trial has expired. Your data is safe — upgrade to access it."
// CTA: "Reactivate" → billing page
```

#### `src/emails/payment-failed.tsx`

```tsx
// Props: gymName, amount, updatePaymentUrl
// Content: "We couldn't process your payment of $X. Please update your card."
// CTA: "Update Payment Method" → Stripe customer portal
```

#### `src/emails/daily-digest.tsx`

```tsx
// Props: gymName, date, stats (checkIns, newLeads, revenue, atRisk, etc.)
// Content: Summary table of yesterday's metrics
// CTA: "View Dashboard" → dashboard
```

### 4. Email Sending Helper

Create `src/lib/send-email.ts`:

```ts
import { resend, FROM_EMAIL } from '@/lib/resend';
import WelcomeEmail from '@/emails/welcome';
import TrialExpiringEmail from '@/emails/trial-expiring';
// ... other imports

type EmailType =
  | { type: 'welcome'; data: { gymName: string; ownerName: string; ownerEmail: string } }
  | { type: 'trial-expiring'; data: { gymName: string; ownerEmail: string; daysLeft: number } }
  | { type: 'trial-expired'; data: { gymName: string; ownerEmail: string } }
  | { type: 'payment-failed'; data: { gymName: string; ownerEmail: string; amount: number } }
  | { type: 'daily-digest'; data: { gymName: string; ownerEmail: string; stats: any } };

export async function sendEmail(email: EmailType) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://gym-os-demo.vercel.app';

  switch (email.type) {
    case 'welcome':
      return resend.emails.send({
        from: FROM_EMAIL,
        to: email.data.ownerEmail,
        subject: `Welcome to GYM OS — ${email.data.gymName} is live!`,
        react: WelcomeEmail({
          gymName: email.data.gymName,
          ownerName: email.data.ownerName,
          dashboardUrl: `${appUrl}/dashboard`,
        }),
      });

    case 'trial-expiring':
      return resend.emails.send({
        from: FROM_EMAIL,
        to: email.data.ownerEmail,
        subject: `${email.data.daysLeft} days left on your GYM OS trial`,
        react: TrialExpiringEmail({ /* ... */ }),
      });

    // ... other cases
  }
}
```

### 5. Wire Into Inngest Jobs

Update the job files from Task 017 to call `sendEmail()`:

```ts
// In welcome-email.ts:
await sendEmail({
  type: 'welcome',
  data: { gymName: event.data.gymName, ownerName: '...', ownerEmail: '...' },
});
```

### 6. Email Preview (Development)

Add script to `package.json`:

```json
"email:dev": "email dev --dir src/emails --port 3001"
```

This starts a local preview server at `localhost:3001` where you can see all email templates with hot reload.

### 7. Domain Verification

For production (not needed for dev):
1. Go to Resend Dashboard → Domains
2. Add your sending domain (e.g., `notifications.gymos.app`)
3. Add the DNS records (DKIM, SPF, Return-Path) to your registrar
4. Verify — takes a few minutes

Until verified, use `onboarding@resend.dev` as the sender.

## File Structure After This Task

```
src/
  emails/
    welcome.tsx
    trial-expiring.tsx
    trial-expired.tsx
    payment-failed.tsx
    daily-digest.tsx
  lib/
    resend.ts           # Resend client
    send-email.ts       # Type-safe email dispatch
```

## Acceptance Criteria

- Resend client is configured
- Email templates are built with React Email (matching GYM OS dark theme)
- `sendEmail()` helper dispatches type-safe emails
- Welcome email fires on new tenant creation
- Trial expiring emails fire 3 days and 1 day before expiration
- Payment failed email fires on Stripe payment failure
- Email preview server works in development
- All emails are sent asynchronously via Inngest (never blocking requests)

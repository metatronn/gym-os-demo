# Task 009: Onboarding Flow (Sign Up → Org Creation → Trial Start)

**Phase:** 1 — Foundation
**Priority:** High
**Depends on:** [006](./006-clerk-auth.md), [008](./008-tenant-middleware.md)
**Blocks:** [010](./010-stripe-setup.md)

---

## Objective

Build the flow a new gym owner experiences: sign up → create their gym (Clerk org) → land on the dashboard with a 14-day trial started automatically.

## Steps

### 1. Onboarding Page

Create `src/app/onboarding/page.tsx`:

The user hits this page after sign-up (configured in Clerk redirect URLs). It should:

1. Check if the user already has an org → redirect to `/dashboard`
2. Show a simple form: **Gym Name** (required), **Location** (optional)
3. On submit:
   - Create a Clerk Organization via the Clerk API
   - Set the user as the active org
   - Redirect to `/dashboard`

```tsx
'use client';

import { useOrganizationList, useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
  const { createOrganization } = useOrganizationList();
  const { organization } = useOrganization();
  const router = useRouter();
  const [gymName, setGymName] = useState('');
  const [loading, setLoading] = useState(false);

  // Already has an org — skip onboarding
  if (organization) {
    router.replace('/dashboard');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const org = await createOrganization!({ name: gymName });
      // Clerk webhook will fire organization.created → creates tenant row + trial
      // Small delay to let webhook process, then redirect
      await new Promise(r => setTimeout(r, 1000));
      router.push('/dashboard');
    } catch (err) {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gym-bg">
      <form onSubmit={handleSubmit} className="bg-gym-card p-8 rounded-xl border border-gym-border max-w-md w-full">
        <h1 className="text-2xl font-bold text-gym-text mb-2">Set up your gym</h1>
        <p className="text-gym-text-secondary mb-6">
          Your 14-day free trial starts now. No credit card required.
        </p>

        <label className="block text-sm text-gym-text-secondary mb-2">
          Gym Name
        </label>
        <input
          type="text"
          value={gymName}
          onChange={(e) => setGymName(e.target.value)}
          required
          className="w-full bg-gym-bg border border-gym-border rounded-lg px-4 py-3 text-gym-text mb-6"
          placeholder="e.g. Undisputed Boxing Gym"
        />

        <button
          type="submit"
          disabled={loading || !gymName}
          className="w-full bg-gym-primary text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Start Free Trial'}
        </button>
      </form>
    </div>
  );
}
```

### 2. Clerk Webhook → Tenant Creation

In `src/app/api/webhooks/clerk/route.ts`, handle `organization.created`:

```ts
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const body = await req.text();
  const svixHeaders = {
    'svix-id': headers().get('svix-id')!,
    'svix-timestamp': headers().get('svix-timestamp')!,
    'svix-signature': headers().get('svix-signature')!,
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  const event = wh.verify(body, svixHeaders) as any;

  switch (event.type) {
    case 'organization.created': {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14);

      await db.insert(tenants).values({
        id: event.data.id,
        name: event.data.name,
        slug: event.data.slug,
        subscriptionStatus: 'trialing',
        trialEndsAt,
      });
      break;
    }
  }

  return new Response('ok');
}
```

### 3. Trial Banner Component

Create a banner that shows on every page during trial:

```tsx
// src/components/TrialBanner.tsx
'use client';

export function TrialBanner({ trialEndsAt }: { trialEndsAt: string }) {
  const daysLeft = Math.ceil(
    (new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 0) {
    return (
      <div className="bg-gym-danger/10 border-b border-gym-danger/20 px-4 py-2 text-center text-sm text-gym-danger">
        Your trial has expired. <a href="/billing" className="underline font-medium">Upgrade now</a> to continue.
      </div>
    );
  }

  return (
    <div className="bg-gym-primary/10 border-b border-gym-primary/20 px-4 py-2 text-center text-sm text-gym-accent">
      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your free trial.{' '}
      <a href="/billing" className="underline font-medium">Upgrade now</a>
    </div>
  );
}
```

### 4. No-Org Guard

In the main layout, if the user is signed in but has no org, redirect to `/onboarding`. This catches the edge case where someone signs in without completing onboarding.

## Acceptance Criteria

- New user signs up → lands on `/onboarding`
- Entering gym name creates a Clerk Organization
- Clerk webhook creates a `tenants` row with 14-day trial
- User is redirected to `/dashboard` with active trial
- Trial banner shows days remaining
- Expired trial shows upgrade prompt
- Users with an existing org skip onboarding

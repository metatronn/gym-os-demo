# Task 009: Onboarding Flow (Sign Up → Org Creation → Trial Start)

**Phase:** 1 — Foundation
**Priority:** High
**Depends on:** [006](./006-auth.md), [008](./008-tenant-middleware.md)
**Blocks:** [010](./010-stripe-setup.md)

---

## Objective

Build the flow a new gym owner experiences: sign up → create their gym (organization) → land on the dashboard with a 14-day trial started automatically.

## Steps

### 1. Onboarding Page

Create `src/app/onboarding/page.tsx`:

The user hits this page after sign-up (redirected by auth middleware if no org exists). It should:

1. Check if the user already has an org → redirect to `/dashboard`
2. Show a simple form: **Gym Name** (required), **Location** (optional)
3. On submit:
   - Call a server action / API route to create the organization and tenant row
   - Re-issue the JWT with the new `orgId` claim
   - Redirect to `/dashboard`

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const [gymName, setGymName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/create-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gymName }),
      });
      if (!res.ok) throw new Error('Failed to create organization');
      // The API route creates the tenant row + trial and re-issues the JWT
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

### 2. Tenant Creation API Route

Create `src/app/api/auth/create-org/route.ts` to handle organization creation:

```ts
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  const { userId } = await requireAuth();
  const { name } = await req.json();

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const [tenant] = await db.insert(tenants).values({
    id: crypto.randomUUID(),
    name,
    slug,
    subscriptionStatus: 'trialing',
    trialEndsAt,
  }).returning();

  // Add the user as an admin member of the new organization
  // Re-issue JWT with orgId and orgRole claims
  // Set the new session cookie

  return new Response(JSON.stringify({ id: tenant.id }), { status: 201 });
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
- Entering gym name creates an organization via the tenant creation API
- API route creates a `tenants` row with 14-day trial
- User is redirected to `/dashboard` with active trial
- Trial banner shows days remaining
- Expired trial shows upgrade prompt
- Users with an existing org skip onboarding

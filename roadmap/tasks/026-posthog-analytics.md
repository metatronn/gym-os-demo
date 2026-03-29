# Task 026: PostHog Analytics & Feature Flags

**Phase:** 6 — Growth
**Priority:** Low
**Depends on:** [002](./002-vercel-project-setup.md)
**Blocks:** Nothing (leaf task)

---

## Objective

Add product analytics to understand how gym owners use GYM OS. Track key events, set up feature flags for gradual rollouts.

## Steps

### 1. Install

```bash
npm install posthog-js
```

### 2. PostHog Provider

Create `src/components/PostHogProvider.tsx`:

```tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageviews: true,
      capture_pageleave: true,
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### 3. Key Events to Track

| Event | When | Properties |
|-------|------|------------|
| `member_created` | New member added | `source`, `plan` |
| `lead_created` | New lead added | `source` |
| `lead_converted` | Lead → member | `source`, `days_to_convert` |
| `class_booked` | Booking made | `class_type` |
| `payment_received` | Successful payment | `amount` |
| `feature_used` | Any feature page visited | `feature_name` |
| `onboarding_completed` | Gym setup done | `time_to_complete` |
| `trial_converted` | Trial → paid | `trial_length_days` |

### 4. Feature Flags

Use PostHog feature flags for:
- New UI experiments
- Gradual rollout of new features
- A/B testing pricing pages

### 5. Identify Users

After auth, identify the user in PostHog:

```ts
posthog.identify(userId, {
  email: user.email,
  orgId: orgId,
  orgName: orgName,
  plan: subscriptionStatus,
});
```

## Acceptance Criteria

- PostHog captures page views and custom events
- Users are identified with tenant context
- Feature flags are available for gradual rollout
- No PII beyond email is sent to PostHog

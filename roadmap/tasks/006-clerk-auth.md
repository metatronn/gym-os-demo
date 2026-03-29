# Task 006: Clerk Authentication & Multi-Tenancy

**Phase:** 1 — Foundation
**Priority:** Critical
**Depends on:** [003](./003-environment-secrets.md)
**Blocks:** [008](./008-tenant-middleware.md), [009](./009-onboarding-flow.md)

---

## Objective

Integrate Clerk for authentication. Use Clerk Organizations as the multi-tenancy primitive — one organization = one gym. Protect all app routes behind auth.

## Steps

### 1. Install Dependencies

```bash
npm install @clerk/nextjs
```

### 2. Clerk Application Setup

In the Clerk Dashboard:

1. Create application `GYM OS`
2. **Sign-in methods:** Email/Password + Google OAuth
3. **Enable Organizations:**
   - Dashboard → Organizations → Enable
   - Allow users to create organizations (this is the "gym signup" flow)
   - Set default role for new org members: `org:member`
4. **Custom roles** (create in Clerk dashboard):
   - `org:admin` — Gym owner, full access
   - `org:coach` — Can manage schedule, members, check-ins
   - `org:staff` — Can view members, check-ins (read-only billing)
5. **Redirect URLs:**
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`

### 3. Middleware

Create `src/middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',  // Stripe & Clerk webhooks must be public
  '/api/health',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 4. Root Layout Update

Wrap the app in `ClerkProvider` in `src/app/layout.tsx`:

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`${inter.className} bg-gym-bg text-gym-text antialiased`}>
          {/* ... existing layout ... */}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 5. Auth Pages

Create `src/app/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gym-bg">
      <SignIn />
    </div>
  );
}
```

Create `src/app/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gym-bg">
      <SignUp />
    </div>
  );
}
```

### 6. Get Current Tenant Helper

Create `src/lib/auth.ts`:

```ts
import { auth } from '@clerk/nextjs/server';

export async function requireAuth() {
  const { userId, orgId, orgRole } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (!orgId) {
    // User is signed in but hasn't selected/created an org yet
    // Redirect to onboarding
    throw new Error('No organization selected');
  }

  return { userId, orgId, orgRole };
}

export async function requireAdmin() {
  const { userId, orgId, orgRole } = await requireAuth();

  if (orgRole !== 'org:admin') {
    throw new Error('Admin access required');
  }

  return { userId, orgId, orgRole };
}
```

### 7. Sidebar User Info

Update the Sidebar component to show the current user and org:

```tsx
import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';

// In the sidebar footer, replace the "Agents Online" section or add above it:
<OrganizationSwitcher
  appearance={{
    baseTheme: dark,
    elements: { rootBox: 'w-full' }
  }}
/>
<UserButton afterSignOutUrl="/sign-in" />
```

### 8. Clerk Webhook (User/Org Sync)

Create `src/app/api/webhooks/clerk/route.ts` to sync Clerk events to the database:

- `organization.created` → Insert tenant row
- `organization.updated` → Update tenant row
- `organizationMembership.created` → Insert staff row
- `user.created` → Insert user row (for cross-org user record)

This webhook is implemented fully in Task 007 (DB Schema) since it requires the schema to exist.

## Acceptance Criteria

- All app routes require authentication (redirect to `/sign-in`)
- Webhook and health routes are public
- Sign-in and sign-up pages render with dark theme
- Clerk Organizations are enabled and usable
- `requireAuth()` helper returns `userId`, `orgId`, and `orgRole`
- `requireAdmin()` gates admin-only operations
- User can create an organization during onboarding
- Organization switcher appears in sidebar

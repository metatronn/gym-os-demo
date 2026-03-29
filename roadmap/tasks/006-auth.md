# Task 006: Authentication & Multi-Tenancy

**Phase:** 1 — Foundation
**Priority:** Critical
**Depends on:** [003](./003-environment-secrets.md)
**Blocks:** [008](./008-tenant-middleware.md), [009](./009-onboarding-flow.md)

---

## Objective

Implement native JWT authentication. Use organizations as the multi-tenancy primitive — one organization = one gym. Protect all app routes behind auth.

## Steps

### 1. Install Dependencies

```bash
npm install jose bcryptjs
npm install -D @types/bcryptjs
```

### 2. Auth Configuration

Configure in `src/lib/auth.ts`:

1. **Sign-in methods:** Email/Password (bcrypt-hashed)
2. **JWT sessions:** Issued via `jose`, stored in HTTP-only cookies
3. **Organizations:**
   - Users create organizations during onboarding (the "gym signup" flow)
   - Default role for new org members: `member`
4. **Custom roles** (stored in the `org_members` table):
   - `admin` — Gym owner, full access
   - `coach` — Can manage schedule, members, check-ins
   - `staff` — Can view members, check-ins (read-only billing)
5. **Redirect URLs:**
   - After sign-in: `/dashboard`
   - After sign-up: `/onboarding`

### 3. Auth API Routes

Create API routes for authentication:

- `src/app/api/auth/sign-up/route.ts` — Register user, hash password with bcrypt, return JWT
- `src/app/api/auth/sign-in/route.ts` — Verify credentials, return JWT
- `src/app/api/auth/sign-out/route.ts` — Clear session cookie
- `src/app/api/auth/me/route.ts` — Return current user from JWT

### 4. JWT Middleware

Create `src/middleware.ts`:

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/webhooks/',
  '/api/auth/',
  '/api/health',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### 5. Root Layout Update

No provider wrapper needed — auth state is read server-side from the JWT cookie. The layout fetches the session in a server component and passes user info down via props or context.

### 6. Auth Pages

Create `src/app/sign-in/page.tsx` — custom sign-in form that POSTs to `/api/auth/sign-in`.

Create `src/app/sign-up/page.tsx` — custom sign-up form that POSTs to `/api/auth/sign-up`.

Both pages use the dark theme styling consistent with the rest of the app.

### 7. Get Current Tenant Helper

Create `src/lib/auth.ts`:

```ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function requireAuth() {
  const token = cookies().get('session')?.value;
  if (!token) throw new Error('Unauthorized');

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);
  const { payload } = await jwtVerify(token, secret);

  const userId = payload.sub as string;
  const orgId = payload.orgId as string | undefined;
  const orgRole = payload.orgRole as string | undefined;

  if (!userId) throw new Error('Unauthorized');

  if (!orgId) {
    // User is signed in but hasn't selected/created an org yet
    // Redirect to onboarding
    throw new Error('No organization selected');
  }

  return { userId, orgId, orgRole };
}

export async function requireAdmin() {
  const { userId, orgId, orgRole } = await requireAuth();

  if (orgRole !== 'admin') {
    throw new Error('Admin access required');
  }

  return { userId, orgId, orgRole };
}
```

### 8. Sidebar User Info

Update the Sidebar component to show the current user and organization:

```tsx
// In the sidebar footer, show organization name and user info
// fetched server-side from the JWT session. Include a sign-out
// button that POSTs to /api/auth/sign-out.
```

### 9. Organization & User Sync

Organization and user records are managed directly in the database:

- Tenant row is created when a user creates an organization during onboarding
- Organization membership is tracked in the `org_members` table
- User records are created at sign-up time

No external webhooks are needed — the app owns the entire auth lifecycle.

## Acceptance Criteria

- All app routes require authentication (redirect to `/sign-in`)
- Webhook, auth API, and health routes are public
- Sign-in and sign-up pages render with dark theme
- Organizations are stored in the database and usable
- `requireAuth()` helper returns `userId`, `orgId`, and `orgRole`
- `requireAdmin()` gates admin-only operations
- User can create an organization during onboarding
- JWT sessions are issued via `jose` with `AUTH_SECRET`

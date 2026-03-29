# GYM OS — Coding Guidelines

## Tech Stack

| Layer | Required | Forbidden |
|-------|----------|-----------|
| Framework | Next.js 14 (App Router) | Pages Router |
| Language | TypeScript (strict) | JavaScript, `any` type |
| Styling | Tailwind CSS with `gym-*` design tokens | CSS modules, styled-components |
| Icons | Lucide React | Font Awesome, Hero Icons |
| Charts | Recharts | Chart.js, D3 (direct) |
| Database | Drizzle ORM + Neon | Prisma, raw SQL strings |
| Auth | Clerk (`@clerk/nextjs`) | NextAuth, custom auth |
| Payments | Stripe (`stripe` package) | PayPal, custom billing |
| Email | Resend + React Email | SendGrid, Nodemailer |
| Jobs | Inngest | BullMQ, node-cron |

## File Naming

- **Pages:** `src/app/{route}/page.tsx` (Next.js convention)
- **Server components:** Default. No directive needed.
- **Client components:** `'use client'` at top. Extract to `{page}-client.tsx` if the page needs both server and client parts.
- **Server actions:** `src/app/{route}/actions.ts`
- **API routes:** `src/app/api/{name}/route.ts`
- **DB queries:** `src/db/queries/{entity}.ts`
- **DB schema:** `src/db/schema/{entity}.ts`
- **Components:** PascalCase. `src/components/{Name}.tsx`

## Design Tokens

All colors use the `gym-*` Tailwind tokens defined in `tailwind.config.ts`:

| Token | Use |
|-------|-----|
| `gym-bg` | Page background (`#0A0F1C`) |
| `gym-card` | Card/panel background (`#111827`) |
| `gym-sidebar` | Sidebar background (`#070B14`) |
| `gym-border` | Borders (`#1E293B`) |
| `gym-primary` | Primary actions, active states (`#0350FF`) |
| `gym-accent` | Secondary accent (`#06B6D4`) |
| `gym-success` | Success states (`#10B981`) |
| `gym-warning` | Warning states (`#F59E0B`) |
| `gym-danger` | Error/danger states (`#EF4444`) |
| `gym-text` | Primary text (`#F1F5F9`) |
| `gym-text-secondary` | Secondary text (`#94A3B8`) |
| `gym-text-muted` | Muted/disabled text (`#64748B`) |

**Never use raw hex values.** Always use `gym-*` tokens.

## Component Patterns

### Page Layout
```tsx
// Server component (default) for data fetching
export default async function MembersPage() {
  const { orgId } = await requireAuth();
  const members = await memberQueries(orgId).list();
  return <MembersClient members={members} />;
}
```

### Client Component
```tsx
'use client';

export function MembersClient({ members }: { members: Member[] }) {
  // Interactive logic here
}
```

### Server Action
```tsx
'use server';

import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createMember(data: CreateMemberInput) {
  const { orgId } = await requireAuth();
  // Always scope to tenant
  const member = await memberQueries(orgId).create(data);
  revalidatePath('/members');
  return member;
}
```

### Database Query (Tenant-Scoped)
```tsx
export function memberQueries(tenantId: string) {
  return {
    async list() {
      return db.select().from(members)
        .where(eq(members.tenantId, tenantId))  // ALWAYS filter by tenant
        .orderBy(desc(members.createdAt));
    },
  };
}
```

## Rules

1. **Every query gets tenant-scoped.** No exceptions. See [tenant-security-auditor](.claude/agents/tenant-security-auditor.md).
2. **Server Components by default.** Only add `'use client'` when you need interactivity.
3. **Server Actions for mutations.** Not API routes (unless webhooks or external consumers).
4. **`revalidatePath` after mutations.** Keep the UI in sync.
5. **No `any` types.** Use Drizzle's `$inferSelect` / `$inferInsert` for DB types.
6. **Responsive design.** Mobile-first. Test at 375px, 768px, 1024px, 1440px.
7. **Dark theme only.** The app is dark-themed. Never use light backgrounds or dark text on light.

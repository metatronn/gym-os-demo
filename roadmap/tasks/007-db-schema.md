# Task 007: Database Schema Design & Initial Migration

**Phase:** 1 — Foundation
**Priority:** Critical
**Depends on:** [005](./005-neon-database.md), [006](./006-clerk-auth.md)
**Blocks:** [008](./008-tenant-middleware.md), [013](./013-members-crud.md), [014](./014-leads-pipeline.md)

---

## Objective

Design and create the core database schema. Every table is tenant-scoped via `tenant_id` (Clerk `orgId`). The schema mirrors and extends the existing mock data types in `src/lib/data.ts`.

## Steps

### 1. Schema File Structure

```
src/db/schema/
  index.ts          # Re-exports everything
  tenants.ts        # Tenant (gym) configuration
  members.ts        # Gym members
  leads.ts          # Lead pipeline
  classes.ts        # Class schedule
  payments.ts       # Payment records (Stripe mirror)
  tasks.ts          # Staff tasks
  messages.ts       # Message threads
  activity.ts       # Activity event log
```

### 2. Core Schema

#### `tenants.ts`

```ts
import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),                    // Clerk orgId
  name: text('name').notNull(),
  slug: text('slug').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').default('trialing'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  slackWebhookUrl: text('slack_webhook_url'),
  settings: jsonb('settings').default({}),         // Gym-specific config
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

#### `members.ts`

Maps to the existing `Member` type in `data.ts`:

```ts
import { pgTable, text, timestamp, integer, real, pgEnum } from 'drizzle-orm/pg-core';

export const memberStatusEnum = pgEnum('member_status', ['active', 'frozen', 'cancelled', 'trial']);
export const riskLevelEnum = pgEnum('risk_level', ['critical', 'high', 'medium', 'low']);
export const planTypeEnum = pgEnum('plan_type', ['Premium', 'Unlimited', 'Basic', 'Trial']);
export const billingStatusEnum = pgEnum('billing_status', ['current', 'failed', 'past-due', 'pending']);

export const members = pgTable('members', {
  id: text('id').primaryKey(),                    // Generated UUID
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  plan: planTypeEnum('plan').default('Trial'),
  status: memberStatusEnum('status').default('trial'),
  riskScore: real('risk_score').default(0),
  riskLevel: riskLevelEnum('risk_level').default('low'),
  lastCheckIn: timestamp('last_check_in', { withTimezone: true }),
  monthlyVisits: integer('monthly_visits').default(0),
  billingStatus: billingStatusEnum('billing_status').default('pending'),
  joinDate: timestamp('join_date', { withTimezone: true }).defaultNow(),
  tags: text('tags').array().default([]),
  notes: text('notes'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

#### `leads.ts`

```ts
export const leadSourceEnum = pgEnum('lead_source', ['Instagram', 'Website', 'Facebook', 'Walk-in', 'Referral', 'Google']);
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'booked', 'converted', 'lost']);

export const leads = pgTable('leads', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  source: leadSourceEnum('source'),
  status: leadStatusEnum('status').default('new'),
  score: integer('score').default(0),
  interest: text('interest'),
  assignedTo: text('assigned_to'),
  lastContact: timestamp('last_contact', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

#### `classes.ts`

```ts
export const classTypeEnum = pgEnum('class_type', ['boxing', 'kickboxing', 'conditioning', 'fundamentals']);

export const classes = pgTable('classes', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  instructor: text('instructor'),
  dayOfWeek: text('day_of_week'),
  time: text('time'),
  duration: integer('duration'),         // minutes
  capacity: integer('capacity'),
  enrolled: integer('enrolled').default(0),
  waitlist: integer('waitlist').default(0),
  type: classTypeEnum('type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

#### `payments.ts`

```ts
export const paymentStatusEnum = pgEnum('payment_status', ['succeeded', 'failed', 'refunded', 'pending']);
export const paymentTypeEnum = pgEnum('payment_type', ['subscription', 'one-time']);

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  memberId: text('member_id').references(() => members.id),
  amount: integer('amount').notNull(),       // cents
  currency: text('currency').default('usd'),
  status: paymentStatusEnum('status').default('pending'),
  type: paymentTypeEnum('type'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  method: text('method'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

#### `tasks.ts`

```ts
export const taskPriorityEnum = pgEnum('task_priority', ['high', 'medium', 'low']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in-progress', 'done']);
export const taskCategoryEnum = pgEnum('task_category', ['follow-up', 'billing', 'operations', 'coaching']);

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  title: text('title').notNull(),
  assignedTo: text('assigned_to'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  priority: taskPriorityEnum('priority').default('medium'),
  status: taskStatusEnum('status').default('todo'),
  category: taskCategoryEnum('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

#### `messages.ts`

```ts
export const messageChannelEnum = pgEnum('message_channel', ['sms', 'email']);
export const contactTypeEnum = pgEnum('contact_type', ['member', 'lead']);

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  contactName: text('contact_name').notNull(),
  contactType: contactTypeEnum('contact_type'),
  channel: messageChannelEnum('channel'),
  lastMessage: text('last_message'),
  unread: boolean('unread').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
```

#### `activity.ts`

```ts
export const activityEventTypeEnum = pgEnum('activity_event_type', [
  'lead-new', 'member-checkin', 'payment-failed', 'risk-flag',
  'outreach-sent', 'lead-converted', 'task-completed',
]);

export const activityEvents = pgTable('activity_events', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  type: activityEventTypeEnum('type').notNull(),
  description: text('description').notNull(),
  relatedId: text('related_id'),
  relatedName: text('related_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

### 3. Indexes

Add indexes for all `tenant_id` foreign keys and commonly queried columns:

```ts
// In each schema file, add:
import { index } from 'drizzle-orm/pg-core';

// Example for members:
export const membersIndexes = {
  tenantIdx: index('members_tenant_idx').on(members.tenantId),
  emailIdx: index('members_email_idx').on(members.tenantId, members.email),
  statusIdx: index('members_status_idx').on(members.tenantId, members.status),
};
```

### 4. Generate & Apply Migration

```bash
npm run db:generate    # Creates SQL migration in ./drizzle/
npm run db:migrate     # Applies to database
```

Review the generated SQL before applying. Commit the migration files.

### 5. Seed Script

Create `src/db/seed.ts` for development — populates a test tenant with the same mock data currently in `src/lib/data.ts`. This ensures the app looks the same after switching from mock to real data.

```bash
# Add to package.json:
"db:seed": "npx tsx src/db/seed.ts"
```

## Acceptance Criteria

- All schema files are in `src/db/schema/` with proper types and enums
- Every table has a `tenant_id` column (except `tenants` itself)
- Indexes exist on `tenant_id` for every table
- Migration is generated and applied cleanly
- Seed script populates a test tenant with data matching current mock data
- Schema types match existing TypeScript types in `src/lib/data.ts`

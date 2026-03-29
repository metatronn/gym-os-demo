CREATE TYPE "public"."staff_status" AS ENUM('active', 'invited', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."billing_status" AS ENUM('current', 'failed', 'past-due', 'pending');--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'frozen', 'cancelled', 'trial');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('Premium', 'Unlimited', 'Basic', 'Trial');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('Instagram', 'Website', 'Facebook', 'Walk-in', 'Referral', 'Google');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'booked', 'converted', 'lost');--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('boxing', 'kickboxing', 'conditioning', 'fundamentals');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('succeeded', 'failed', 'refunded', 'pending');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('subscription', 'one-time');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('follow-up', 'billing', 'operations', 'coaching');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('todo', 'in-progress', 'done');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('member', 'lead');--> statement-breakpoint
CREATE TYPE "public"."message_channel" AS ENUM('sms', 'email');--> statement-breakpoint
CREATE TYPE "public"."activity_event_type" AS ENUM('lead-new', 'member-checkin', 'payment-failed', 'risk-flag', 'outreach-sent', 'lead-converted', 'task-completed');--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"full_name" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'org:staff' NOT NULL,
	"email" text,
	"name" text,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"avatar_url" text,
	"plan" "plan_type" DEFAULT 'Trial' NOT NULL,
	"status" "member_status" DEFAULT 'trial' NOT NULL,
	"risk_score" real DEFAULT 0 NOT NULL,
	"risk_level" "risk_level" DEFAULT 'low' NOT NULL,
	"last_check_in" timestamp with time zone,
	"monthly_visits" integer DEFAULT 0 NOT NULL,
	"billing_status" "billing_status" DEFAULT 'pending' NOT NULL,
	"join_date" timestamp with time zone DEFAULT now() NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"source" "lead_source",
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"interest" text,
	"assigned_to" text,
	"last_contact" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"instructor" text,
	"day_of_week" text,
	"time" text,
	"duration" integer,
	"capacity" integer,
	"enrolled" integer DEFAULT 0 NOT NULL,
	"waitlist" integer DEFAULT 0 NOT NULL,
	"type" "class_type",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"member_id" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"type" "payment_type",
	"stripe_payment_intent_id" text,
	"method" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"title" text NOT NULL,
	"assigned_to" text,
	"due_date" timestamp with time zone,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"category" "task_category",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"contact_name" text NOT NULL,
	"contact_type" "contact_type",
	"channel" "message_channel",
	"last_message" text,
	"unread" boolean DEFAULT false NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"type" "activity_event_type" NOT NULL,
	"description" text NOT NULL,
	"related_id" text,
	"related_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "slug" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "settings" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "staff_memberships" ADD CONSTRAINT "staff_memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_memberships" ADD CONSTRAINT "staff_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_full_name_idx" ON "users" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "staff_memberships_tenant_idx" ON "staff_memberships" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "staff_memberships_user_idx" ON "staff_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_memberships_role_idx" ON "staff_memberships" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE INDEX "members_tenant_idx" ON "members" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "members" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "members_risk_idx" ON "members" USING btree ("tenant_id","risk_level");--> statement-breakpoint
CREATE INDEX "leads_tenant_idx" ON "leads" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "classes_tenant_idx" ON "classes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "classes_day_idx" ON "classes" USING btree ("tenant_id","day_of_week");--> statement-breakpoint
CREATE INDEX "payments_tenant_idx" ON "payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payments_member_idx" ON "payments" USING btree ("tenant_id","member_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tasks_tenant_idx" ON "tasks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("tenant_id","due_date");--> statement-breakpoint
CREATE INDEX "messages_tenant_idx" ON "messages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "messages_unread_idx" ON "messages" USING btree ("tenant_id","unread");--> statement-breakpoint
CREATE INDEX "messages_channel_idx" ON "messages" USING btree ("tenant_id","channel");--> statement-breakpoint
CREATE INDEX "activity_events_tenant_idx" ON "activity_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "activity_events_created_at_idx" ON "activity_events" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "tenants_subscription_status_idx" ON "tenants" USING btree ("subscription_status");
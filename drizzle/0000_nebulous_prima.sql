CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'unpaid');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100),
	"subscription_status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"trial_ends_at" timestamp with time zone,
	"slack_webhook_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "tenants_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);

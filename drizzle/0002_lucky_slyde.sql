CREATE TYPE "public"."booking_source" AS ENUM('self', 'staff', 'classpass', 'ai_chat', 'ai_voice');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('available', 'confirmed', 'checked_in', 'waitlisted', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"class_id" text NOT NULL,
	"member_id" text NOT NULL,
	"station_id" text,
	"status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"source" "booking_source" DEFAULT 'self' NOT NULL,
	"is_first_timer" boolean DEFAULT false NOT NULL,
	"checked_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_tenant_idx" ON "bookings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "bookings_class_idx" ON "bookings" USING btree ("tenant_id","class_id");--> statement-breakpoint
CREATE INDEX "bookings_member_idx" ON "bookings" USING btree ("tenant_id","member_id");
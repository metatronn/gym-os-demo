ALTER TABLE "messages" RENAME COLUMN "last_message_at" TO "timestamp";--> statement-breakpoint
ALTER TABLE "members" RENAME COLUMN "avatar_url" TO "avatar";--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "member_name" text;--> statement-breakpoint
UPDATE "payments"
SET "member_name" = "members"."name"
FROM "members"
WHERE "payments"."member_id" = "members"."id"
  AND "payments"."member_name" IS NULL;

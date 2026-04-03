-- DropColumn: Replace last_ticket_reset with per-ticket-type regen timestamps
-- Copy existing value to both new columns so no data is lost
ALTER TABLE "users" ADD COLUMN "last_hunt_ticket_regen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "users" ADD COLUMN "last_battle_ticket_regen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill from existing last_ticket_reset
UPDATE "users" SET "last_hunt_ticket_regen" = "last_ticket_reset", "last_battle_ticket_regen" = "last_ticket_reset";

-- Drop old column
ALTER TABLE "users" DROP COLUMN "last_ticket_reset";

-- Add daily login streak fields
ALTER TABLE "users" ADD COLUMN "login_streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "last_login_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "total_logins" INTEGER NOT NULL DEFAULT 0;

-- Add teaches_move to items (for MoveBook / TM items)
ALTER TABLE "items" ADD COLUMN "teaches_move" TEXT;

-- Add ticket rewards to quest templates
ALTER TABLE "quest_templates" ADD COLUMN "reward_hunt_tickets" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "quest_templates" ADD COLUMN "reward_battle_tickets" INTEGER NOT NULL DEFAULT 0;

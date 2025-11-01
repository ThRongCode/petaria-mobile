/*
  Warnings:

  - You are about to drop the column `expires_at` on the `hunt_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `energy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_heal_time` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `max_energy` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "hunt_sessions" DROP COLUMN "expires_at";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "energy",
DROP COLUMN "last_heal_time",
DROP COLUMN "max_energy",
ADD COLUMN     "battle_tickets" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "hunt_tickets" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "item_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_ticket_reset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pet_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "last_heal_time" TIMESTAMP(3),
ADD COLUMN     "settings_auto_feed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "settings_battle_animations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "settings_language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "settings_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "settings_sound_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "title" TEXT DEFAULT 'Pokemon Trainer';

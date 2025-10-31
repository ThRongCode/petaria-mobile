-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 1000,
    "gems" INTEGER NOT NULL DEFAULT 50,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "max_energy" INTEGER NOT NULL DEFAULT 100,
    "last_heal_time" TIMESTAMP(3),
    "battles_won" INTEGER NOT NULL DEFAULT 0,
    "battles_lost" INTEGER NOT NULL DEFAULT 0,
    "hunts_completed" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "nickname" TEXT,
    "rarity" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL,
    "max_hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "evolution_stage" INTEGER NOT NULL DEFAULT 1,
    "mood" INTEGER NOT NULL DEFAULT 100,
    "last_fed" TIMESTAMP(3),
    "is_for_sale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "effect_hp" INTEGER,
    "effect_attack" INTEGER,
    "effect_defense" INTEGER,
    "effect_speed" INTEGER,
    "effect_xp_boost" INTEGER,
    "is_permanent" BOOLEAN NOT NULL DEFAULT false,
    "price_coins" INTEGER,
    "price_gems" INTEGER,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_items" (
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_items_pkey" PRIMARY KEY ("user_id","item_id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "energy_cost" INTEGER NOT NULL,
    "coins_cost" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "unlock_level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "region_spawns" (
    "id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "spawn_rate" DOUBLE PRECISION NOT NULL,
    "min_level" INTEGER NOT NULL,
    "max_level" INTEGER NOT NULL,

    CONSTRAINT "region_spawns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunt_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "encounters_data" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hunt_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hunts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "region_id" TEXT NOT NULL,
    "pets_caught" INTEGER NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "coins_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "hunts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opponents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "max_hp" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "reward_xp" INTEGER NOT NULL,
    "reward_coins" INTEGER NOT NULL,
    "unlock_level" INTEGER NOT NULL DEFAULT 1,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "opponents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battle_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "battle_type" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battle_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "battle_type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "xp_earned" INTEGER NOT NULL,
    "coins_earned" INTEGER NOT NULL,
    "turns_taken" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moves" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pet_moves" (
    "pet_id" TEXT NOT NULL,
    "move_id" TEXT NOT NULL,
    "pp" INTEGER NOT NULL,
    "max_pp" INTEGER NOT NULL,

    CONSTRAINT "pet_moves_pkey" PRIMARY KEY ("pet_id","move_id")
);

-- CreateTable
CREATE TABLE "opponent_moves" (
    "opponent_id" TEXT NOT NULL,
    "move_id" TEXT NOT NULL,

    CONSTRAINT "opponent_moves_pkey" PRIMARY KEY ("opponent_id","move_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "pets_owner_id_idx" ON "pets"("owner_id");

-- CreateIndex
CREATE INDEX "user_items_user_id_idx" ON "user_items"("user_id");

-- CreateIndex
CREATE INDEX "region_spawns_region_id_idx" ON "region_spawns"("region_id");

-- CreateIndex
CREATE INDEX "hunt_sessions_user_id_idx" ON "hunt_sessions"("user_id");

-- CreateIndex
CREATE INDEX "hunts_user_id_idx" ON "hunts"("user_id");

-- CreateIndex
CREATE INDEX "battle_sessions_user_id_idx" ON "battle_sessions"("user_id");

-- CreateIndex
CREATE INDEX "battles_user_id_created_at_idx" ON "battles"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region_spawns" ADD CONSTRAINT "region_spawns_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunt_sessions" ADD CONSTRAINT "hunt_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunt_sessions" ADD CONSTRAINT "hunt_sessions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunts" ADD CONSTRAINT "hunts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hunts" ADD CONSTRAINT "hunts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_sessions" ADD CONSTRAINT "battle_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battle_sessions" ADD CONSTRAINT "battle_sessions_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "opponents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "battles" ADD CONSTRAINT "battles_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "opponents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_moves" ADD CONSTRAINT "pet_moves_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pet_moves" ADD CONSTRAINT "pet_moves_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opponent_moves" ADD CONSTRAINT "opponent_moves_opponent_id_fkey" FOREIGN KEY ("opponent_id") REFERENCES "opponents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opponent_moves" ADD CONSTRAINT "opponent_moves_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

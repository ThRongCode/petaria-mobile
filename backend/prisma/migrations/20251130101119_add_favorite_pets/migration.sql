-- CreateTable
CREATE TABLE "favorite_pets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_pets_user_id_idx" ON "favorite_pets"("user_id");

-- CreateIndex
CREATE INDEX "favorite_pets_pet_id_idx" ON "favorite_pets"("pet_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_pets_user_id_pet_id_key" ON "favorite_pets"("user_id", "pet_id");

-- AddForeignKey
ALTER TABLE "favorite_pets" ADD CONSTRAINT "favorite_pets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_pets" ADD CONSTRAINT "favorite_pets_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

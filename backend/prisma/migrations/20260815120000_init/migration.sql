-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('CLASSROOM', 'COMPUTER_LAB', 'LECTURER_OFFICE', 'DEPARTMENT_OFFICE', 'MEETING_ROOM', 'RESTROOM', 'ENTRANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "SubsystemRole" AS ENUM ('GUEST', 'EDITOR', 'ADMIN');

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "room_code" TEXT,
    "name_th" TEXT NOT NULL,
    "name_en" TEXT,
    "description" TEXT,
    "category" "PlaceCategory" NOT NULL,
    "position_x" DECIMAL(6,2) NOT NULL,
    "position_y" DECIMAL(6,2) NOT NULL,
    "width" DECIMAL(6,2),
    "height" DECIMAL(6,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_th" TEXT NOT NULL,
    "name_en" TEXT,
    "email" TEXT,
    "place_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_keywords" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "keyword" TEXT NOT NULL,
    "place_id" UUID NOT NULL,

    CONSTRAINT "search_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_overrides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "role" "SubsystemRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_overrides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "places_room_code_key" ON "places"("room_code");
CREATE INDEX "places_category_is_active_idx" ON "places"("category", "is_active");
CREATE INDEX "lecturers_place_id_idx" ON "lecturers"("place_id");
CREATE UNIQUE INDEX "search_keywords_keyword_place_id_key" ON "search_keywords"("keyword", "place_id");
CREATE INDEX "search_keywords_place_id_idx" ON "search_keywords"("place_id");
CREATE UNIQUE INDEX "role_overrides_username_key" ON "role_overrides"("username");

-- AddForeignKey
ALTER TABLE "lecturers" ADD CONSTRAINT "lecturers_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "search_keywords" ADD CONSTRAINT "search_keywords_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

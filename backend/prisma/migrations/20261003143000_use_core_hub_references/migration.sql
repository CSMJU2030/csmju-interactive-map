-- Keep existing map geometry and migration history. Names of Core Hub rooms
-- and personal information are no longer copied into subsystem tables.
BEGIN;
ALTER TABLE "places" RENAME COLUMN "name_th" TO "landmark_label";
ALTER TABLE "places" ALTER COLUMN "landmark_label" DROP NOT NULL;
UPDATE "places" SET "landmark_label" = NULL WHERE "room_code" IS NOT NULL;
ALTER TABLE "places" DROP COLUMN "name_en";
ALTER TABLE "places" ADD CONSTRAINT "places_label_source_check"
  CHECK (("room_code" IS NOT NULL AND "landmark_label" IS NULL)
    OR ("room_code" IS NULL AND "landmark_label" IS NOT NULL AND LENGTH(TRIM("landmark_label")) > 0));

ALTER TABLE "lecturers" ADD COLUMN IF NOT EXISTS "person_code" TEXT;
ALTER TABLE "lecturers" ADD COLUMN IF NOT EXISTS "core_user_id" VARCHAR(64);
-- Never invent identities or delete an existing assignment silently.
-- Operators must map existing lecturers to Core Hub person_code before deployment.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "lecturers" WHERE "person_code" IS NULL) THEN
    RAISE EXCEPTION 'Map existing lecturers to Core Hub person_code before applying this migration; see docs/core-hub-integration.md';
  END IF;
END $$;
ALTER TABLE "lecturers" ALTER COLUMN "person_code" SET NOT NULL;
DROP INDEX "lecturers_source_id_key";
DROP INDEX "lecturers_personnel_type_idx";
ALTER TABLE "lecturers"
  DROP COLUMN "source_id", DROP COLUMN "title", DROP COLUMN "name_th", DROP COLUMN "name_en",
  DROP COLUMN "personnel_type", DROP COLUMN "position_academic", DROP COLUMN "position_manager",
  DROP COLUMN "image_profile", DROP COLUMN "email", DROP COLUMN "phone", DROP COLUMN "education", DROP COLUMN "academic_type";
ALTER TABLE "lecturers" RENAME TO "personnel_assignments";
ALTER TABLE "personnel_assignments" RENAME CONSTRAINT "lecturers_pkey" TO "personnel_assignments_pkey";
ALTER TABLE "personnel_assignments" RENAME CONSTRAINT "lecturers_place_id_fkey" TO "personnel_assignments_place_id_fkey";
ALTER INDEX "lecturers_place_id_idx" RENAME TO "personnel_assignments_place_id_idx";
CREATE UNIQUE INDEX "personnel_assignments_person_code_key" ON "personnel_assignments"("person_code");
CREATE INDEX "personnel_assignments_core_user_id_idx" ON "personnel_assignments"("core_user_id");
DROP TABLE "role_overrides";
COMMIT;

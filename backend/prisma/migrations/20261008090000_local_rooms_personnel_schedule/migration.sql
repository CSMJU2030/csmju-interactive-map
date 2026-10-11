BEGIN;
ALTER TABLE "places" DROP CONSTRAINT "places_label_source_check";
UPDATE "places" SET "landmark_label" = "room_code" WHERE "landmark_label" IS NULL;
ALTER TABLE "personnel_assignments"
  ADD COLUMN "name_th" TEXT,
  ADD COLUMN "name_en" TEXT,
  ADD COLUMN "personnel_type" "PersonnelType" NOT NULL DEFAULT 'TEACHER',
  ADD COLUMN "email" TEXT,
  ADD COLUMN "position_academic" TEXT,
  ADD COLUMN "position_manager" TEXT;
-- Keep assignments reviewable; old names were discarded by the previous migration.
UPDATE "personnel_assignments" SET "name_th" = "person_code";
ALTER TABLE "personnel_assignments" ALTER COLUMN "name_th" SET NOT NULL;
CREATE TABLE "teaching_sessions" (
  "id" UUID NOT NULL,
  "place_id" UUID NOT NULL REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "lecturer_id" UUID NOT NULL REFERENCES "personnel_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "day_of_week" INTEGER NOT NULL CHECK ("day_of_week" BETWEEN 0 AND 6),
  "start_time" VARCHAR(5) NOT NULL,
  "end_time" VARCHAR(5) NOT NULL,
  "valid_from" VARCHAR(10) NOT NULL,
  "valid_until" VARCHAR(10) NOT NULL,
  "course_name" TEXT NOT NULL,
  CONSTRAINT "teaching_sessions_pkey" PRIMARY KEY ("id"),
  CHECK ("start_time" < "end_time" AND "valid_from" <= "valid_until")
);
CREATE INDEX "teaching_sessions_place_id_idx" ON "teaching_sessions"("place_id");
CREATE INDEX "teaching_sessions_lecturer_id_day_of_week_idx" ON "teaching_sessions"("lecturer_id", "day_of_week");
COMMIT;

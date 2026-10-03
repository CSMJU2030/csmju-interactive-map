CREATE TYPE "PersonnelType" AS ENUM ('TEACHER', 'STAFF');

ALTER TABLE "lecturers"
ADD COLUMN "source_id" INTEGER,
ADD COLUMN "title" VARCHAR(30),
ADD COLUMN "personnel_type" "PersonnelType" NOT NULL DEFAULT 'TEACHER',
ADD COLUMN "position_academic" TEXT,
ADD COLUMN "position_manager" TEXT,
ADD COLUMN "image_profile" TEXT,
ADD COLUMN "phone" VARCHAR(100),
ADD COLUMN "education" TEXT,
ADD COLUMN "academic_type" VARCHAR(100);

CREATE UNIQUE INDEX "lecturers_source_id_key" ON "lecturers"("source_id");
CREATE INDEX "lecturers_personnel_type_idx" ON "lecturers"("personnel_type");

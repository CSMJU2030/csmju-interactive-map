ALTER TABLE "personnel_assignments"
ADD COLUMN "source_personnel_id" TEXT,
ADD COLUMN "image_profile" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "education" TEXT;
CREATE UNIQUE INDEX "personnel_assignments_source_personnel_id_key" ON "personnel_assignments"("source_personnel_id");

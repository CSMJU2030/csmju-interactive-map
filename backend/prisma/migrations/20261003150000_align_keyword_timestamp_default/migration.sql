-- Prisma @updatedAt manages the value; keep the database default in sync.
ALTER TABLE "search_keywords" ALTER COLUMN "updated_at" DROP DEFAULT;

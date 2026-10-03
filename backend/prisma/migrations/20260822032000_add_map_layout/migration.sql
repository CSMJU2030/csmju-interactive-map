-- CreateTable
CREATE TABLE "map_layouts" (
    "id" VARCHAR(32) NOT NULL DEFAULT 'main',
    "corridor_points" JSONB NOT NULL,
    "corridor_width" DECIMAL(4,2) NOT NULL DEFAULT 4.2,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "map_layouts_pkey" PRIMARY KEY ("id")
);

-- Seed the editable U-shaped corridor used by the initial floor plan.
INSERT INTO "map_layouts" ("id", "corridor_points", "corridor_width", "updated_at")
VALUES (
    'main',
    '[{"x":25,"y":7},{"x":25,"y":39},{"x":31,"y":44},{"x":84,"y":44},{"x":89,"y":38},{"x":89,"y":7}]'::jsonb,
    4.2,
    CURRENT_TIMESTAMP
);

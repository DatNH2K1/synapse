-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create Table: Node
CREATE TABLE "Node" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL DEFAULT 'LESSON',
    "label" TEXT NOT NULL,
    "content_hash" TEXT,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "last_verified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "properties" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "embedding" vector(3072),
    "embeddingModel" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- Create Table: Tag
CREATE TABLE "Tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scope" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "color" TEXT NOT NULL DEFAULT '#818cf8',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- Create Table: Archive
CREATE TABLE "Archive" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fromNodeId" UUID NOT NULL,
    "toNodeId" UUID NOT NULL,
    "reason" TEXT,
    "similarityScore" DOUBLE PRECISION,
    "mergedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Archive_pkey" PRIMARY KEY ("id")
);

-- Create Table: _NodeTags (Implicit Join Table)
CREATE TABLE "_NodeTags" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- Create Indexes
CREATE UNIQUE INDEX "Tag_scope_name_version_key" ON "Tag"("scope", "name", "version");
CREATE UNIQUE INDEX "_NodeTags_AB_unique" ON "_NodeTags"("A", "B");
CREATE INDEX "_NodeTags_B_index" ON "_NodeTags"("B");

-- Add Foreign Keys
ALTER TABLE "_NodeTags" ADD CONSTRAINT "_NodeTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_NodeTags" ADD CONSTRAINT "_NodeTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

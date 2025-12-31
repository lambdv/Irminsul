-- Migration for adding admin role table
-- Run this migration to enable database-based admin role management

CREATE TABLE IF NOT EXISTS "admin" (
    "id" VARCHAR(255) PRIMARY KEY NOT NULL,
    "user_id" VARCHAR(255) NOT NULL UNIQUE,
    "role" VARCHAR(50) NOT NULL DEFAULT 'admin',
    "permissions" TEXT[],
    "created_at" TIMESTAMP(3) DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP(3) DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "admin_user_id_idx" ON "admin"("user_id");

-- Add comment
COMMENT ON TABLE "admin" IS 'Admin roles and permissions management table';
COMMENT ON COLUMN "admin"."role" IS 'User role: admin, moderator';
COMMENT ON COLUMN "admin"."permissions" IS 'Array of specific permissions granted to the user';

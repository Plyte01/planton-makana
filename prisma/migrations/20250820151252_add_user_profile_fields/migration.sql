-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "tagline" TEXT;

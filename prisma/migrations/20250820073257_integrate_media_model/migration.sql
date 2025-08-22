/*
  Warnings:

  - You are about to drop the column `coverImage` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[coverImageId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coverImageId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "coverImage",
ADD COLUMN     "coverImageId" TEXT;

-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "coverImage",
ADD COLUMN     "coverImageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_coverImageId_key" ON "public"."Post"("coverImageId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_coverImageId_key" ON "public"."Project"("coverImageId");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

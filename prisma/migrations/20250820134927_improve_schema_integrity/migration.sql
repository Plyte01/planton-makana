/*
  Warnings:

  - A unique constraint covering the columns `[mediaId]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mediaId` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Resume" ADD COLUMN     "mediaId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_mediaId_key" ON "public"."Resume"("mediaId");

-- AddForeignKey
ALTER TABLE "public"."Resume" ADD CONSTRAINT "Resume_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

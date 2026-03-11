/*
  Warnings:

  - You are about to drop the column `importedAt` on the `ImportLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ImportLog" DROP COLUMN "importedAt",
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "recordsCount" INTEGER,
ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "StoreType";

-- CreateIndex
CREATE INDEX "ImportLog_companyId_idx" ON "ImportLog"("companyId");

/*
  Warnings:

  - You are about to alter the column `price` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `clubPrice` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[productId,storeId]` on the table `Price` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PriceReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Price_productId_storeId_idx";

-- AlterTable
ALTER TABLE "Price" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "clubPrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isWeighted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PriceReport" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "storeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reportedPrice" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "ocrText" TEXT,
    "isWeighted" BOOLEAN NOT NULL DEFAULT false,
    "freshnessScore" INTEGER,
    "cleanlinessScore" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "PriceReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreReview" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "freshnessScore" INTEGER,
    "cleanlinessScore" INTEGER,
    "serviceScore" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceReport_productId_storeId_status_idx" ON "PriceReport"("productId", "storeId", "status");

-- CreateIndex
CREATE INDEX "StoreReview_storeId_idx" ON "StoreReview"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Price_productId_storeId_key" ON "Price"("productId", "storeId");

-- AddForeignKey
ALTER TABLE "PriceReport" ADD CONSTRAINT "PriceReport_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceReport" ADD CONSTRAINT "PriceReport_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

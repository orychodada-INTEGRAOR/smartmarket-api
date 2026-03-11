/*
  Warnings:

  - You are about to drop the column `currency` on the `Price` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Price" DROP COLUMN "currency";

-- CreateTable
CREATE TABLE "AggregatedPrice" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cheapestPrice" DOUBLE PRECISION NOT NULL,
    "cheapestStoreId" TEXT NOT NULL,
    "cheapestChainId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AggregatedPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePriceSnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AggregatedPrice_cheapestStoreId_idx" ON "AggregatedPrice"("cheapestStoreId");

-- CreateIndex
CREATE UNIQUE INDEX "AggregatedPrice_productId_key" ON "AggregatedPrice"("productId");

-- CreateIndex
CREATE INDEX "StorePriceSnapshot_storeId_idx" ON "StorePriceSnapshot"("storeId");

-- CreateIndex
CREATE INDEX "StorePriceSnapshot_productId_idx" ON "StorePriceSnapshot"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "StorePriceSnapshot_productId_storeId_key" ON "StorePriceSnapshot"("productId", "storeId");

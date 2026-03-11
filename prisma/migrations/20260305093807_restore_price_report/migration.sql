-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('PHYSICAL', 'ONLINE');

-- CreateEnum
CREATE TYPE "PriceReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

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

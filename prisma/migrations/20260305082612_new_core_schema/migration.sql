/*
  Warnings:

  - The primary key for the `Chain` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `slug` on the `Chain` table. All the data in the column will be lost.
  - The primary key for the `Price` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clubPrice` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Price` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - The primary key for the `PriceHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `changedAt` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `newPrice` on the `PriceHistory` table. All the data in the column will be lost.
  - You are about to drop the column `oldPrice` on the `PriceHistory` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `isWeighted` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unitQuantity` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `Promotion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `discountType` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `Promotion` table. All the data in the column will be lost.
  - The primary key for the `Store` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportedFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceReport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreReview` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `PriceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceId` to the `PriceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_productId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_storeId_fkey";

-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_productId_storeId_fkey";

-- DropForeignKey
ALTER TABLE "PriceReport" DROP CONSTRAINT "PriceReport_productId_fkey";

-- DropForeignKey
ALTER TABLE "PriceReport" DROP CONSTRAINT "PriceReport_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_productId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_chainId_fkey";

-- DropForeignKey
ALTER TABLE "StoreReview" DROP CONSTRAINT "StoreReview_storeId_fkey";

-- DropIndex
DROP INDEX "Chain_name_key";

-- DropIndex
DROP INDEX "Chain_slug_key";

-- DropIndex
DROP INDEX "Product_barcode_key";

-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- AlterTable
ALTER TABLE "Chain" DROP CONSTRAINT "Chain_pkey",
DROP COLUMN "slug",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Chain_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Chain_id_seq";

-- AlterTable
ALTER TABLE "Price" DROP CONSTRAINT "Price_pkey",
DROP COLUMN "clubPrice",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "Price_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Price_id_seq";

-- AlterTable
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_pkey",
DROP COLUMN "changedAt",
DROP COLUMN "newPrice",
DROP COLUMN "oldPrice",
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "priceId" TEXT NOT NULL,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "validTo" TIMESTAMP(3),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PriceHistory_id_seq";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "categoryId",
DROP COLUMN "isWeighted",
DROP COLUMN "unitQuantity",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "unitOfMeasure" TEXT,
ADD COLUMN     "unitQty" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "barcode" DROP NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Product_id_seq";

-- AlterTable
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_pkey",
DROP COLUMN "discountType",
DROP COLUMN "discountValue",
ADD COLUMN     "minQty" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Promotion_id_seq";

-- AlterTable
ALTER TABLE "Store" DROP CONSTRAINT "Store_pkey",
DROP COLUMN "type",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "chainId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Store_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Store_id_seq";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "ImportedFile";

-- DropTable
DROP TABLE "PriceReport";

-- DropTable
DROP TABLE "StoreReview";

-- DropEnum
DROP TYPE "PriceReportStatus";

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL,
    "message" TEXT,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "Price"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

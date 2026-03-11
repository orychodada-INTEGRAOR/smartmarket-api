-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "normalizedProductId" TEXT;

-- CreateTable
CREATE TABLE "NormalizedProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "size" DOUBLE PRECISION,
    "unit" TEXT,
    "category" TEXT,
    "searchTokens" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NormalizedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NormalizedProduct_name_key" ON "NormalizedProduct"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_normalizedProductId_fkey" FOREIGN KEY ("normalizedProductId") REFERENCES "NormalizedProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

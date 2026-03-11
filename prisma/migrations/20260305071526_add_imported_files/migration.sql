-- CreateTable
CREATE TABLE "ImportedFile" (
    "id" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileTimestamp" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportedFile_companyId_idx" ON "ImportedFile"("companyId");

-- CreateIndex
CREATE INDEX "ImportedFile_fileTimestamp_idx" ON "ImportedFile"("fileTimestamp");

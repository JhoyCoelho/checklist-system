-- CreateTable
CREATE TABLE "Justification" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "checklistType" TEXT NOT NULL,
    "expectedDate" TIMESTAMP(3),
    "filledDate" TIMESTAMP(3),
    "expectedTime" TEXT,
    "filledTime" TEXT,
    "reason" TEXT NOT NULL,
    "otherReason" TEXT,
    "description" TEXT,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Justification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSignature" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSignature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Justification_checklistId_key" ON "Justification"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSignature_checklistId_key" ON "AdminSignature"("checklistId");

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSignature" ADD CONSTRAINT "AdminSignature_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSignature" ADD CONSTRAINT "AdminSignature_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

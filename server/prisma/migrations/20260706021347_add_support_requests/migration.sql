-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('LISTENING', 'ADVICE', 'ENCOURAGEMENT', 'CHECK_IN');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('OPEN', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SUPPORT_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'SUPPORT_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'SUPPORT_CANCELLED';

-- CreateTable
CREATE TABLE "support_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "supporterId" TEXT,
    "type" "SupportType" NOT NULL,
    "message" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "SupportStatus" NOT NULL DEFAULT 'OPEN',
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_requests_requesterId_idx" ON "support_requests"("requesterId");

-- CreateIndex
CREATE INDEX "support_requests_supporterId_idx" ON "support_requests"("supporterId");

-- CreateIndex
CREATE INDEX "support_requests_status_createdAt_idx" ON "support_requests"("status", "createdAt");

-- CreateIndex
CREATE INDEX "support_requests_type_status_idx" ON "support_requests"("type", "status");

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_supporterId_fkey" FOREIGN KEY ("supporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

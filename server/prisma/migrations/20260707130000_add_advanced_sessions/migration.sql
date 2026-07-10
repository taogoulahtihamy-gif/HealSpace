-- Évolution sans suppression de la colonne historique "token".
-- Le schéma Prisma la mappe désormais vers la propriété "tokenHash".

ALTER TABLE "refresh_tokens"
ADD COLUMN "familyId" TEXT,
ADD COLUMN "deviceId" TEXT,
ADD COLUMN "userAgent" TEXT,
ADD COLUMN "ipAddress" TEXT,
ADD COLUMN "lastUsedAt" TIMESTAMP(3),
ADD COLUMN "revokedReason" TEXT,
ADD COLUMN "replacedByTokenId" TEXT;

-- Chaque ancien jeton devient sa propre famille afin de préserver les données.
UPDATE "refresh_tokens"
SET "familyId" = "id"
WHERE "familyId" IS NULL;

ALTER TABLE "refresh_tokens"
ALTER COLUMN "familyId" SET NOT NULL;

CREATE INDEX "refresh_tokens_userId_revokedAt_idx"
ON "refresh_tokens"("userId", "revokedAt");

CREATE INDEX "refresh_tokens_familyId_idx"
ON "refresh_tokens"("familyId");

CREATE INDEX "refresh_tokens_expiresAt_idx"
ON "refresh_tokens"("expiresAt");

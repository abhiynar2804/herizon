ALTER TABLE "User"
ADD COLUMN "emailVerificationToken" TEXT,
ADD COLUMN "emailVerificationExpiry" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_emailVerificationToken_key"
ON "User"("emailVerificationToken");
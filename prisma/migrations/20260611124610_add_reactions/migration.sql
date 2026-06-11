-- CreateTable
CREATE TABLE "reaction" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reaction_postId_idx" ON "reaction"("postId");

-- CreateIndex
CREATE INDEX "reaction_userId_idx" ON "reaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_postId_userId_key" ON "reaction"("postId", "userId");

-- AddForeignKey
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reaction" ADD CONSTRAINT "reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

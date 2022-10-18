-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL,
    "totalAdwords" INTEGER,
    "totalLinks" INTEGER,
    "totalSearchResults" BIGINT,
    "html" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

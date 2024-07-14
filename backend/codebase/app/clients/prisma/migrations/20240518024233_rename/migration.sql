/*
  Warnings:

  - You are about to drop the column `forkerRepoFullName` on the `Repo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "forkerRepoFullName",
ADD COLUMN     "forkedRepoFullName" TEXT NOT NULL DEFAULT '';

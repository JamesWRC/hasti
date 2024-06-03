/*
  Warnings:

  - A unique constraint covering the columns `[githubNodeID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `githubNodeID` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubNodeID" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_githubNodeID_key" ON "User"("githubNodeID");

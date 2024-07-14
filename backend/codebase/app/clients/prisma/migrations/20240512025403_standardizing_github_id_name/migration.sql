/*
  Warnings:

  - You are about to drop the column `gitHubID` on the `Collaborator` table. All the data in the column will be lost.
  - Added the required column `githubID` to the `Collaborator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Collaborator" DROP COLUMN "gitHubID",
ADD COLUMN     "githubID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- CreateIndex
CREATE INDEX "collaborator_githubID_index" ON "Collaborator"("githubID");

-- CreateIndex
CREATE INDEX "repoID_index" ON "Collaborator"("repoID");

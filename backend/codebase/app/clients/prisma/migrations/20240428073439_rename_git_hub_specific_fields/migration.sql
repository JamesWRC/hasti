/*
  Warnings:

  - You are about to drop the column `nodeID` on the `Repo` table. All the data in the column will be lost.
  - You are about to drop the column `repoID` on the `Repo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gitHubRepoID]` on the table `Repo` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Repo_repoID_key";

-- DropIndex
DROP INDEX "repoID_index";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "nodeID",
DROP COLUMN "repoID",
ADD COLUMN     "gitHubNodeID" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "gitHubRepoID" INTEGER NOT NULL DEFAULT -1;

-- CreateIndex
CREATE UNIQUE INDEX "Repo_gitHubRepoID_key" ON "Repo"("gitHubRepoID");

-- CreateIndex
CREATE INDEX "gitHubRepoID_index" ON "Repo"("gitHubRepoID");

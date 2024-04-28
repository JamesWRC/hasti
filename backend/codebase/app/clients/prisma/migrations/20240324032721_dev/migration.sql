/*
  Warnings:

  - Added the required column `repoID` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "backgroundImage" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "profileImage" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "repoID" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userID" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_repoID_fkey" FOREIGN KEY ("repoID") REFERENCES "Repo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

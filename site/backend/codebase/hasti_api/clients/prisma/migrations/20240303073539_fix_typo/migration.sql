/*
  Warnings:

  - You are about to drop the column `noedID` on the `Repo` table. All the data in the column will be lost.
  - Added the required column `nodeID` to the `Repo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Repo" DROP COLUMN "noedID",
ADD COLUMN     "nodeID" VARCHAR(255) NOT NULL;

-- CreateTable
CREATE TABLE "Tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

/*
  Warnings:

  - Added the required column `about` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "about" VARCHAR(255) NOT NULL,
ADD COLUMN     "title" VARCHAR(255) NOT NULL;

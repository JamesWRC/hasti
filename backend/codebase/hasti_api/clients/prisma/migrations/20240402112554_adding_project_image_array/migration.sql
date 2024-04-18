-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "images" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "tagNames" VARCHAR(255)[] DEFAULT ARRAY[]::VARCHAR(255)[],
ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

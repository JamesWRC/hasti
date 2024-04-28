-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "contentImages" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "WebhookEvents" ADD COLUMN     "source" VARCHAR(255) NOT NULL DEFAULT 'github';

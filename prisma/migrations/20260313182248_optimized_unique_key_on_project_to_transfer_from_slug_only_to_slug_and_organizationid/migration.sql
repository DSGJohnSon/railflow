/*
  Warnings:

  - A unique constraint covering the columns `[organizationId,slug]` on the table `project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "project_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "project_organizationId_slug_key" ON "project"("organizationId", "slug");

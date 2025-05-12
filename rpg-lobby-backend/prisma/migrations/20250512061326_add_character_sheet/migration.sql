/*
  Warnings:

  - You are about to drop the column `data` on the `CharacterSheet` table. All the data in the column will be lost.
  - Added the required column `name` to the `CharacterSheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CharacterSheet" DROP COLUMN "data",
ADD COLUMN     "charisma" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "constitution" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "dexterity" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "intelligence" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "strength" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "wisdom" INTEGER NOT NULL DEFAULT 8;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

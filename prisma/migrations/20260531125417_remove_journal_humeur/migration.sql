/*
  Warnings:

  - You are about to drop the column `humeur` on the `Journal` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Journal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenu" TEXT NOT NULL,
    "cultureId" INTEGER NOT NULL,
    CONSTRAINT "Journal_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Journal" ("contenu", "cultureId", "date", "id") SELECT "contenu", "cultureId", "date", "id" FROM "Journal";
DROP TABLE "Journal";
ALTER TABLE "new_Journal" RENAME TO "Journal";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

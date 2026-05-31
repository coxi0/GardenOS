/*
  Warnings:

  - Made the column `typePlanteId` on table `Plante` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Parcelle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "superficie" REAL,
    "exposition" TEXT,
    "notes" TEXT,
    "posX" INTEGER NOT NULL DEFAULT 0,
    "posY" INTEGER NOT NULL DEFAULT 0,
    "typeSolId" INTEGER,
    CONSTRAINT "Parcelle_typeSolId_fkey" FOREIGN KEY ("typeSolId") REFERENCES "TypeSol" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Parcelle" ("exposition", "id", "nom", "notes", "superficie", "typeSolId") SELECT "exposition", "id", "nom", "notes", "superficie", "typeSolId" FROM "Parcelle";
DROP TABLE "Parcelle";
ALTER TABLE "new_Parcelle" RENAME TO "Parcelle";
CREATE TABLE "new_Plante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "nomLatin" TEXT,
    "description" TEXT,
    "conseil" TEXT,
    "maladies" TEXT,
    "ensoleillement" TEXT,
    "moisSemisDebut" INTEGER NOT NULL,
    "moisSemisFin" INTEGER NOT NULL,
    "joursArrosage" INTEGER NOT NULL,
    "joursMaturation" INTEGER NOT NULL,
    "typePlanteId" INTEGER NOT NULL,
    CONSTRAINT "Plante_typePlanteId_fkey" FOREIGN KEY ("typePlanteId") REFERENCES "TypePlante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Plante" ("conseil", "description", "ensoleillement", "id", "joursArrosage", "joursMaturation", "maladies", "moisSemisDebut", "moisSemisFin", "nom", "nomLatin", "typePlanteId") SELECT "conseil", "description", "ensoleillement", "id", "joursArrosage", "joursMaturation", "maladies", "moisSemisDebut", "moisSemisFin", "nom", "nomLatin", "typePlanteId" FROM "Plante";
DROP TABLE "Plante";
ALTER TABLE "new_Plante" RENAME TO "Plante";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "typePlanteId" INTEGER,
    CONSTRAINT "Plante_typePlanteId_fkey" FOREIGN KEY ("typePlanteId") REFERENCES "TypePlante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Plante" ("conseil", "description", "ensoleillement", "id", "joursArrosage", "joursMaturation", "maladies", "moisSemisDebut", "moisSemisFin", "nom", "nomLatin", "typePlanteId") SELECT "conseil", "description", "ensoleillement", "id", "joursArrosage", "joursMaturation", "maladies", "moisSemisDebut", "moisSemisFin", "nom", "nomLatin", "typePlanteId" FROM "Plante";
DROP TABLE "Plante";
ALTER TABLE "new_Plante" RENAME TO "Plante";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

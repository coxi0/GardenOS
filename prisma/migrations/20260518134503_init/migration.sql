/*
  Warnings:

  - You are about to drop the `Garden` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Garden";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Plant";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TypePlante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TypeSol" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TypeAssociation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StatutCulture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TypeAlerte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CategorieStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Plante" (
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

-- CreateTable
CREATE TABLE "Parcelle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "superficie" REAL,
    "exposition" TEXT,
    "notes" TEXT,
    "typeSolId" INTEGER,
    CONSTRAINT "Parcelle_typeSolId_fkey" FOREIGN KEY ("typeSolId") REFERENCES "TypeSol" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Culture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateSemisPrevue" DATETIME NOT NULL,
    "dateRecoltePrevue" DATETIME NOT NULL,
    "dateSemisReelle" DATETIME,
    "dateRecolteReelle" DATETIME,
    "notes" TEXT,
    "planteId" INTEGER NOT NULL,
    "parcelleId" INTEGER NOT NULL,
    "statutId" INTEGER NOT NULL,
    CONSTRAINT "Culture_planteId_fkey" FOREIGN KEY ("planteId") REFERENCES "Plante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Culture_parcelleId_fkey" FOREIGN KEY ("parcelleId") REFERENCES "Parcelle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Culture_statutId_fkey" FOREIGN KEY ("statutId") REFERENCES "StatutCulture" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "unite" TEXT NOT NULL,
    "seuilAlerte" REAL,
    "notes" TEXT,
    "categorieId" INTEGER NOT NULL,
    "planteId" INTEGER,
    CONSTRAINT "StockItem_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "CategorieStock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockItem_planteId_fkey" FOREIGN KEY ("planteId") REFERENCES "Plante" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alerte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datePrevu" DATETIME NOT NULL,
    "faite" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "cultureId" INTEGER NOT NULL,
    "typeAlerteId" INTEGER NOT NULL,
    CONSTRAINT "Alerte_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alerte_typeAlerteId_fkey" FOREIGN KEY ("typeAlerteId") REFERENCES "TypeAlerte" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recolte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantite" REAL NOT NULL,
    "unite" TEXT NOT NULL,
    "notes" TEXT,
    "cultureId" INTEGER NOT NULL,
    CONSTRAINT "Recolte_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contenu" TEXT NOT NULL,
    "humeur" TEXT,
    "cultureId" INTEGER NOT NULL,
    CONSTRAINT "Journal_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "libelle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CultureTag" (
    "cultureId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("cultureId", "tagId"),
    CONSTRAINT "CultureTag_cultureId_fkey" FOREIGN KEY ("cultureId") REFERENCES "Culture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CultureTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Association" (
    "planteAId" INTEGER NOT NULL,
    "planteBId" INTEGER NOT NULL,
    "typeAssociationId" INTEGER NOT NULL,
    "raison" TEXT,

    PRIMARY KEY ("planteAId", "planteBId"),
    CONSTRAINT "Association_planteAId_fkey" FOREIGN KEY ("planteAId") REFERENCES "Plante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Association_planteBId_fkey" FOREIGN KEY ("planteBId") REFERENCES "Plante" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Association_typeAssociationId_fkey" FOREIGN KEY ("typeAssociationId") REFERENCES "TypeAssociation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TypePlante_libelle_key" ON "TypePlante"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypeSol_libelle_key" ON "TypeSol"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypeAssociation_libelle_key" ON "TypeAssociation"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "StatutCulture_libelle_key" ON "StatutCulture"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypeAlerte_libelle_key" ON "TypeAlerte"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "CategorieStock_libelle_key" ON "CategorieStock"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_libelle_key" ON "Tag"("libelle");

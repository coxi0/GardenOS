/*
  Warnings:

  - You are about to drop the `Alerte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Association` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeAlerte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeAssociation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Alerte";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Association";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TypeAlerte";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TypeAssociation";
PRAGMA foreign_keys=on;

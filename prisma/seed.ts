import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('./dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const types = ['Légume', 'Aromatique', 'Fruit', 'Fleur', 'Arbre', "Plante d'intérieur"];
  for (const libelle of types) {
    await prisma.typePlante.upsert({
      where: { libelle },
      update: {},
      create: { libelle },
    });
  }

  console.log('Seed TypePlante OK');

  const categories = ['Graine', 'Outil', 'Engrais', 'Traitement'];
  for (const libelle of categories) {
    await prisma.categorieStock.upsert({
      where: { libelle },
      update: {},
      create: { libelle },
    });
  }

  console.log('Seed CategorieStock OK');

  const StatutCulture = ['Planifiée', 'En cours', 'Récoltée', 'Abandonnée']
  for (const libelle of StatutCulture) {
    await prisma.statutCulture.upsert({
      where: { libelle },
      update: {},
      create: { libelle },
    });
  }

  console.log('Seed StatutCulture OK');

  const TypeSol  = ['Argileux', 'Sableux', 'Limoneux', 'Calcaire', 'Humifère']
  for (const libelle of TypeSol) {
    await prisma.typeSol.upsert({
      where: { libelle },
      update: {},
      create: { libelle },
    });
  }

  console.log('Seed TypeSol OK');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

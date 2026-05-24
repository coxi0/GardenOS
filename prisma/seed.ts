import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'node:path';

const dbPath = path.resolve('./dev.db');
const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const types = ['Légume', 'Aromatique', 'Fruit', 'Fleur', 'Arbre'];
  for (const libelle of types) {
    await prisma.typePlante.upsert({
      where: { libelle },
      update: {},
      create: { libelle },
    });
  }

  console.log('Seed TypePlante OK');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

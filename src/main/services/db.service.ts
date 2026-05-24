import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { app } from 'electron';
import path from 'node:path';

// En prod : userData (persistent). En dev : __dirname = .vite/build/, ../../ = racine projet.
function getDbPath(): string {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'gardenos.db');
  }
  return path.join(__dirname, '..', '..', 'dev.db');
}

let _prisma: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!_prisma) {
    const dbPath = getDbPath();
    const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
    _prisma = new PrismaClient({ adapter } as any);
  }
  return _prisma;
}

export async function disconnectDb(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}

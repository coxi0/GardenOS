import { PrismaClient } from '../../../generated/prisma';
import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

// En production, la DB doit être dans le dossier userData (persistent, par utilisateur).
// En dev, on utilise le chemin du .env (file:./dev.db).
function getDatabaseUrl(): string {
  if (app.isPackaged) {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'gardenos.db');
    return `file:${dbPath}`;
  }
  return process.env['DATABASE_URL'] ?? 'file:./dev.db';
}

// Singleton : une seule instance Prisma pour toute la durée de vie de l'app.
let _prisma: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      datasources: { db: { url: getDatabaseUrl() } },
    });
  }
  return _prisma;
}

export async function disconnectDb(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}

import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { app } from 'electron';
import path from 'node:path';

/**
 * Retourne le chemin absolu vers le fichier SQLite.
 * En production, la base est stockée dans le répertoire userData d'Electron
 * afin d'être accessible en écriture sur toutes les plateformes.
 */
function getDbPath(): string {
  if (app.isPackaged) {
    return path.join(app.getPath('userData'), 'gardenos.db');
  }
  return path.join(__dirname, '..', '..', 'dev.db');
}

/** Instance Prisma partagée (singleton). */
let _prisma: PrismaClient | null = null;

/**
 * Retourne l'instance Prisma partagée, en la créant à la première invocation.
 * Utilise l'adaptateur better-sqlite3 pour une compatibilité Electron.
 */
export function getDb(): PrismaClient {
  if (!_prisma) {
    const dbPath = getDbPath();
    const adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
    _prisma = new PrismaClient({ adapter } as any);
  }
  return _prisma;
}

/** Ferme proprement la connexion Prisma et libère le singleton. */
export async function disconnectDb(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
}

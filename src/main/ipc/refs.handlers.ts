import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateRefDto } from '../../shared/ipc/refs.ipc';

/**
 * Enregistre tous les handlers IPC liés aux référentiels de l'application :
 * types de plante, types de sol, statuts de culture et catégories de stock.
 * Ces données sont gérées dans la page Paramètres.
 */
export function registerRefsHandlers() {
  const db = getDb();

  /** Crée un nouveau type de plante. */
  ipcMain.handle('typePlantes:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.typePlante.create({ data: dto });
    } catch (err) {
      console.error('[typePlantes:create]', err);
      throw err;
    }
  });

  /** Supprime un type de plante par son identifiant. */
  ipcMain.handle('typePlantes:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.typePlante.delete({ where: { id } });
    } catch (err) {
      console.error('[typePlantes:delete]', err);
      throw err;
    }
  });

  /** Crée un nouveau type de sol. */
  ipcMain.handle('typesSol:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.typeSol.create({ data: dto });
    } catch (err) {
      console.error('[typesSol:create]', err);
      throw err;
    }
  });

  /** Supprime un type de sol par son identifiant. */
  ipcMain.handle('typesSol:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.typeSol.delete({ where: { id } });
    } catch (err) {
      console.error('[typesSol:delete]', err);
      throw err;
    }
  });

  /** Crée un nouveau statut de culture. */
  ipcMain.handle('statutsCulture:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.statutCulture.create({ data: dto });
    } catch (err) {
      console.error('[statutsCulture:create]', err);
      throw err;
    }
  });

  /** Supprime un statut de culture par son identifiant. */
  ipcMain.handle('statutsCulture:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.statutCulture.delete({ where: { id } });
    } catch (err) {
      console.error('[statutsCulture:delete]', err);
      throw err;
    }
  });

  /** Crée une nouvelle catégorie de stock. */
  ipcMain.handle('categoriesStock:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.categorieStock.create({ data: dto });
    } catch (err) {
      console.error('[categoriesStock:create]', err);
      throw err;
    }
  });

  /** Supprime une catégorie de stock par son identifiant. */
  ipcMain.handle('categoriesStock:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.categorieStock.delete({ where: { id } });
    } catch (err) {
      console.error('[categoriesStock:delete]', err);
      throw err;
    }
  });
}

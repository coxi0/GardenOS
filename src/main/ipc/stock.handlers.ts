import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateStockItemDto, UpdateStockItemDto } from '../../shared/ipc/stock.ipc';

/** Fragment Prisma `include` pour un article de stock : catégorie et plante associée incluses. */
const include = { categorie: true, plante: true };

/**
 * Enregistre tous les handlers IPC liés au stock :
 * articles de stock et catégories de stock.
 */
export function registerStockHandlers() {
  const db = getDb();

  /** Retourne toutes les catégories de stock triées alphabétiquement. */
  ipcMain.handle('categoriesStock:getAll', async () => {
    try {
      return db.categorieStock.findMany({ orderBy: { libelle: 'asc' } });
    } catch (err) {
      console.error('[categoriesStock:getAll]', err);
      throw err;
    }
  });

  /** Retourne tous les articles de stock avec catégorie et plante, triés par nom. */
  ipcMain.handle('stocks:getAll', async () => {
    try {
      return db.stockItem.findMany({ include, orderBy: { nom: 'asc' } });
    } catch (err) {
      console.error('[stocks:getAll]', err);
      throw err;
    }
  });

  /** Retourne un article de stock par son identifiant, ou null si introuvable. */
  ipcMain.handle('stocks:getById', async (_event, { id }: { id: number }) => {
    try {
      return db.stockItem.findUnique({ where: { id }, include });
    } catch (err) {
      console.error('[stocks:getById]', err);
      throw err;
    }
  });

  /** Crée un nouvel article de stock et le retourne avec catégorie et plante. */
  ipcMain.handle('stocks:create', async (_event, dto: CreateStockItemDto) => {
    try {
      return db.stockItem.create({ data: dto, include });
    } catch (err) {
      console.error('[stocks:create]', err);
      throw err;
    }
  });

  /** Met à jour un article de stock existant et le retourne avec catégorie et plante. */
  ipcMain.handle('stocks:update', async (_event, dto: UpdateStockItemDto) => {
    try {
      const { id, ...data } = dto;
      return db.stockItem.update({ where: { id }, data, include });
    } catch (err) {
      console.error('[stocks:update]', err);
      throw err;
    }
  });

  /** Supprime un article de stock par son identifiant. */
  ipcMain.handle('stocks:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.stockItem.delete({ where: { id } });
    } catch (err) {
      console.error('[stocks:delete]', err);
      throw err;
    }
  });
}

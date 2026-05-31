import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateStockItemDto, UpdateStockItemDto } from '../../shared/ipc/stock.ipc';

const include = { categorie: true, plante: true };

export function registerStockHandlers() {
  const db = getDb();

  ipcMain.handle('categoriesStock:getAll', async () => {
    try {
      return db.categorieStock.findMany({ orderBy: { libelle: 'asc' } });
    } catch (err) {
      console.error('[categoriesStock:getAll]', err);
      throw err;
    }
  });

  ipcMain.handle('stocks:getAll', async () => {
    try {
      return db.stockItem.findMany({ include, orderBy: { nom: 'asc' } });
    } catch (err) {
      console.error('[stocks:getAll]', err);
      throw err;
    }
  });

  ipcMain.handle('stocks:getById', async (_event, { id }: { id: number }) => {
    try {
      return db.stockItem.findUnique({ where: { id }, include });
    } catch (err) {
      console.error('[stocks:getById]', err);
      throw err;
    }
  });

  ipcMain.handle('stocks:create', async (_event, dto: CreateStockItemDto) => {
    try {
      return db.stockItem.create({ data: dto, include });
    } catch (err) {
      console.error('[stocks:create]', err);
      throw err;
    }
  });

  ipcMain.handle('stocks:update', async (_event, dto: UpdateStockItemDto) => {
    try {
      const { id, ...data } = dto;
      return db.stockItem.update({ where: { id }, data, include });
    } catch (err) {
      console.error('[stocks:update]', err);
      throw err;
    }
  });

  ipcMain.handle('stocks:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.stockItem.delete({ where: { id } });
    } catch (err) {
      console.error('[stocks:delete]', err);
      throw err;
    }
  });
}

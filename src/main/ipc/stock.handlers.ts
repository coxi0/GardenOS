import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateStockItemDto, UpdateStockItemDto } from '../../shared/ipc/stock.ipc';

const include = { categorie: true, plante: true };

export function registerStockHandlers() {
  const db = getDb();

  ipcMain.handle('categoriesStock:getAll', async () => {
    return db.categorieStock.findMany({ orderBy: { libelle: 'asc' } });
  });

  ipcMain.handle('stocks:getAll', async () => {
    return db.stockItem.findMany({ include, orderBy: { nom: 'asc' } });
  });

  ipcMain.handle('stocks:getById', async (_event, { id }: { id: number }) => {
    return db.stockItem.findUnique({ where: { id }, include });
  });

  ipcMain.handle('stocks:create', async (_event, dto: CreateStockItemDto) => {
    return db.stockItem.create({ data: dto, include });
  });

  ipcMain.handle('stocks:update', async (_event, dto: UpdateStockItemDto) => {
    const { id, ...data } = dto;
    return db.stockItem.update({ where: { id }, data, include });
  });

  ipcMain.handle('stocks:delete', async (_event, { id }: { id: number }) => {
    await db.stockItem.delete({ where: { id } });
  });
}

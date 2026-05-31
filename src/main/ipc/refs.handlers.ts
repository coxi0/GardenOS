import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateRefDto } from '../../shared/ipc/refs.ipc';

export function registerRefsHandlers() {
  const db = getDb();

  ipcMain.handle('typePlantes:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.typePlante.create({ data: dto });
    } catch (err) {
      console.error('[typePlantes:create]', err);
      throw err;
    }
  });

  ipcMain.handle('typePlantes:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.typePlante.delete({ where: { id } });
    } catch (err) {
      console.error('[typePlantes:delete]', err);
      throw err;
    }
  });

  ipcMain.handle('typesSol:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.typeSol.create({ data: dto });
    } catch (err) {
      console.error('[typesSol:create]', err);
      throw err;
    }
  });

  ipcMain.handle('typesSol:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.typeSol.delete({ where: { id } });
    } catch (err) {
      console.error('[typesSol:delete]', err);
      throw err;
    }
  });

  ipcMain.handle('statutsCulture:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.statutCulture.create({ data: dto });
    } catch (err) {
      console.error('[statutsCulture:create]', err);
      throw err;
    }
  });

  ipcMain.handle('statutsCulture:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.statutCulture.delete({ where: { id } });
    } catch (err) {
      console.error('[statutsCulture:delete]', err);
      throw err;
    }
  });

  ipcMain.handle('categoriesStock:create', async (_e, dto: CreateRefDto) => {
    try {
      return db.categorieStock.create({ data: dto });
    } catch (err) {
      console.error('[categoriesStock:create]', err);
      throw err;
    }
  });

  ipcMain.handle('categoriesStock:delete', async (_e, { id }: { id: number }) => {
    try {
      return db.categorieStock.delete({ where: { id } });
    } catch (err) {
      console.error('[categoriesStock:delete]', err);
      throw err;
    }
  });
}

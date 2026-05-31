import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateRefDto } from '../../shared/ipc/refs.ipc';

export function registerRefsHandlers() {
  const db = getDb();

  ipcMain.handle('typePlantes:create',        async (_e, dto: CreateRefDto) => db.typePlante.create({ data: dto }));
  ipcMain.handle('typePlantes:delete',        async (_e, { id }: { id: number }) => db.typePlante.delete({ where: { id } }));

  ipcMain.handle('typesSol:create',           async (_e, dto: CreateRefDto) => db.typeSol.create({ data: dto }));
  ipcMain.handle('typesSol:delete',           async (_e, { id }: { id: number }) => db.typeSol.delete({ where: { id } }));

  ipcMain.handle('statutsCulture:create',     async (_e, dto: CreateRefDto) => db.statutCulture.create({ data: dto }));
  ipcMain.handle('statutsCulture:delete',     async (_e, { id }: { id: number }) => db.statutCulture.delete({ where: { id } }));

  ipcMain.handle('categoriesStock:create',    async (_e, dto: CreateRefDto) => db.categorieStock.create({ data: dto }));
  ipcMain.handle('categoriesStock:delete',    async (_e, { id }: { id: number }) => db.categorieStock.delete({ where: { id } }));
}

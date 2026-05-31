import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateRefDto } from '../../shared/ipc/refs.ipc';

export function registerRefsHandlers() {
  const db = getDb();

  ipcMain.handle('typePlantes:create',        async (_e, dto: CreateRefDto) => db.typePlante.create({ data: dto }));
  ipcMain.handle('typePlantes:delete',        async (_e, { id }: { id: number }) => db.typePlante.delete({ where: { id } }));

  ipcMain.handle('typesSol:create',           async (_e, dto: CreateRefDto) => db.typeSol.create({ data: dto }));
  ipcMain.handle('typesSol:delete',           async (_e, { id }: { id: number }) => db.typeSol.delete({ where: { id } }));

  ipcMain.handle('typesAssociation:getAll',   async () => db.typeAssociation.findMany({ orderBy: { libelle: 'asc' } }));
  ipcMain.handle('typesAssociation:create',   async (_e, dto: CreateRefDto) => db.typeAssociation.create({ data: dto }));
  ipcMain.handle('typesAssociation:delete',   async (_e, { id }: { id: number }) => db.typeAssociation.delete({ where: { id } }));

  ipcMain.handle('statutsCulture:create',     async (_e, dto: CreateRefDto) => db.statutCulture.create({ data: dto }));
  ipcMain.handle('statutsCulture:delete',     async (_e, { id }: { id: number }) => db.statutCulture.delete({ where: { id } }));

  ipcMain.handle('typesAlerte:getAll',        async () => db.typeAlerte.findMany({ orderBy: { libelle: 'asc' } }));
  ipcMain.handle('typesAlerte:create',        async (_e, dto: CreateRefDto) => db.typeAlerte.create({ data: dto }));
  ipcMain.handle('typesAlerte:delete',        async (_e, { id }: { id: number }) => db.typeAlerte.delete({ where: { id } }));

  ipcMain.handle('categoriesStock:create',    async (_e, dto: CreateRefDto) => db.categorieStock.create({ data: dto }));
  ipcMain.handle('categoriesStock:delete',    async (_e, { id }: { id: number }) => db.categorieStock.delete({ where: { id } }));
}

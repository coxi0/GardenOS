import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreatePlanteDto, UpdatePlanteDto, WikipediaResult } from '../../shared/ipc/plante.ipc';

export function registerPlanteHandlers() {
  const db = getDb();

  ipcMain.handle('typePlantes:getAll', async () => {
    return db.typePlante.findMany({ orderBy: { libelle: 'asc' } });
  });

  ipcMain.handle('plantes:getAll', async () => {
    return db.plante.findMany({
      include: { typePlante: true },
      orderBy: { nom: 'asc' },
    });
  });

  ipcMain.handle('plantes:getById', async (_event, { id }: { id: number }) => {
    return db.plante.findUnique({
      where: { id },
      include: { typePlante: true },
    });
  });

  ipcMain.handle('plantes:create', async (_event, dto: CreatePlanteDto) => {
    return db.plante.create({
      data: dto,
      include: { typePlante: true },
    });
  });

  ipcMain.handle('plantes:update', async (_event, dto: UpdatePlanteDto) => {
    const { id, ...data } = dto;
    return db.plante.update({
      where: { id },
      data,
      include: { typePlante: true },
    });
  });

  ipcMain.handle('plantes:delete', async (_event, { id }: { id: number }) => {
    await db.plante.delete({ where: { id } });
  });

  ipcMain.handle('plantes:scrapeWikipedia', async (_event, { nom }: { nom: string }): Promise<WikipediaResult | null> => {
    try {
      const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nom)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json() as { title: string; description?: string; extract: string };
      return {
        titre: data.title,
        description: data.description ?? null,
        extrait: data.extract,
      };
    } catch {
      return null;
    }
  });
}

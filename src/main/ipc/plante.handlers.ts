import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreatePlanteDto, UpdatePlanteDto, WikipediaResult } from '../../shared/ipc/plante.ipc';

/**
 * Enregistre tous les handlers IPC liés aux plantes et types de plante.
 * Couvre les opérations CRUD sur `Plante` et `TypePlante`,
 * ainsi que la récupération de données depuis l'API REST Wikipedia.
 */
export function registerPlanteHandlers() {
  const db = getDb();

  /** Retourne tous les types de plante triés alphabétiquement. */
  ipcMain.handle('typePlantes:getAll', async () => {
    return db.typePlante.findMany({ orderBy: { libelle: 'asc' } });
  });

  /** Retourne le nombre total de plantes dans le catalogue. */
  ipcMain.handle('plantes:count', async () => {
    return db.plante.count();
  });

  /** Retourne toutes les plantes avec leur type, triées par nom. */
  ipcMain.handle('plantes:getAll', async () => {
    return db.plante.findMany({
      include: { typePlante: true },
      orderBy: { nom: 'asc' },
    });
  });

  /** Retourne une plante par son identifiant, ou null si introuvable. */
  ipcMain.handle('plantes:getById', async (_event, { id }: { id: number }) => {
    return db.plante.findUnique({
      where: { id },
      include: { typePlante: true },
    });
  });

  /** Crée une nouvelle plante et la retourne avec son type. */
  ipcMain.handle('plantes:create', async (_event, dto: CreatePlanteDto) => {
    return db.plante.create({
      data: dto,
      include: { typePlante: true },
    });
  });

  /** Met à jour une plante existante et la retourne avec son type. */
  ipcMain.handle('plantes:update', async (_event, dto: UpdatePlanteDto) => {
    const { id, ...data } = dto;
    return db.plante.update({
      where: { id },
      data,
      include: { typePlante: true },
    });
  });

  /** Supprime une plante par son identifiant. */
  ipcMain.handle('plantes:delete', async (_event, { id }: { id: number }) => {
    await db.plante.delete({ where: { id } });
  });

  /**
   * Interroge l'API REST Wikipedia (version française) pour obtenir
   * le résumé d'une plante à partir de son nom.
   * Retourne null si la page est introuvable ou en cas d'erreur réseau.
   */
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

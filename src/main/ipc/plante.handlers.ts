import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreatePlanteDto, UpdatePlanteDto, WikipediaResult } from '../../shared/ipc/plante.ipc';

/**
 * Récupère la propriété P225 (taxon name) d'une entité Wikidata.
 * Retourne null si l'entité n'est pas un taxon ou en cas d'erreur réseau.
 */
async function fetchTaxonName(wikidataId: string): Promise<string | null> {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json() as any;
    return data?.entities?.[wikidataId]?.claims?.P225?.[0]?.mainsnak?.datavalue?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Interroge Wikipedia (FR) puis Wikidata pour enrichir une plante à partir de son nom.
 * Flux : Wikipedia REST API → wikibase_item → Wikidata P225 (nom scientifique).
 * Retourne null si la page est introuvable.
 */
async function scrapeWikipedia(nom: string): Promise<WikipediaResult | null> {
  const wikiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nom)}`;
  const wikiRes = await fetch(wikiUrl);
  if (!wikiRes.ok) return null;
  const data = await wikiRes.json() as any;

  // Si le titre est déjà un binôme latin (ex : "Matricaria chamomilla"), on le garde directement.
  const titleIsBinomial = /^[A-Z][a-z]+ [a-z]+/.test(data.title ?? '');
  let nomLatin: string | null = titleIsBinomial ? data.title : null;
  if (!nomLatin && data.wikibase_item) {
    nomLatin = await fetchTaxonName(data.wikibase_item);
  }

  return {
    title:       data.title,
    nomLatin,
    description: data.description ?? null,
    extract:     data.extract     ?? null,
  };
}

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

  /** Enrichit une plante via Wikipedia + Wikidata (appel réseau côté main, pas renderer). */
  ipcMain.handle('plantes:scrapeWikipedia', async (_event, { nom }: { nom: string }): Promise<WikipediaResult | null> => {
    try {
      return await scrapeWikipedia(nom);
    } catch (err) {
      console.error('[plantes:scrapeWikipedia]', err);
      return null;
    }
  });
}

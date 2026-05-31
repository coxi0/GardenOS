import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateParcelleDto, UpdateParcelleDto, CreateCultureDto, UpdateCultureDto, CreateRecolteDto } from '../../shared/ipc/jardin.ipc';

/**
 * Fragment Prisma `include` pour une parcelle complète :
 * toutes ses cultures avec plante, statut, tags et récoltes inclus.
 */
const includeParcelle = {
  cultures: {
    include: {
      plante:   true,
      statut:   true,
      tags:     { include: { tag: true } },
      recoltes: { orderBy: { date: 'asc' as const } },
    },
  },
};

/**
 * Fragment Prisma `include` pour une culture complète :
 * plante, statut, tags et récoltes inclus.
 */
const includeCulture = {
  plante:   true,
  statut:   true,
  tags:     { include: { tag: true } },
  recoltes: { orderBy: { date: 'asc' as const } },
};

/**
 * Convertit une chaîne ISO 8601 en objet Date, ou retourne null si la valeur est absente.
 * Nécessaire car les DTOs transmis via IPC sont sérialisés en JSON (les Date deviennent des strings).
 */
function toDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(s);
}

/**
 * Enregistre tous les handlers IPC liés au jardin :
 * parcelles, cultures, récoltes, tags, statuts de culture et types de sol.
 */
export function registerJardinHandlers() {
  const db = getDb();

  /** Retourne tous les statuts de culture triés alphabétiquement. */
  ipcMain.handle('statutsCulture:getAll', async () => {
    try {
      return db.statutCulture.findMany({ orderBy: { libelle: 'asc' } });
    } catch (err) {
      console.error('[statutsCulture:getAll]', err);
      throw err;
    }
  });

  /** Retourne tous les types de sol triés alphabétiquement. */
  ipcMain.handle('typesSol:getAll', async () => {
    try {
      return db.typeSol.findMany({ orderBy: { libelle: 'asc' } });
    } catch (err) {
      console.error('[typesSol:getAll]', err);
      throw err;
    }
  });

  /** Retourne tous les tags triés alphabétiquement. */
  ipcMain.handle('tags:getAll', async () => {
    try {
      return db.tag.findMany({ orderBy: { libelle: 'asc' } });
    } catch (err) {
      console.error('[tags:getAll]', err);
      throw err;
    }
  });

  /** Retourne toutes les parcelles avec leurs cultures complètes, triées par nom. */
  ipcMain.handle('parcelles:getAll', async () => {
    try {
      return db.parcelle.findMany({ include: includeParcelle, orderBy: { nom: 'asc' } });
    } catch (err) {
      console.error('[parcelles:getAll]', err);
      throw err;
    }
  });

  /** Crée une nouvelle parcelle et la retourne avec ses cultures. */
  ipcMain.handle('parcelles:create', async (_event, dto: CreateParcelleDto) => {
    try {
      return db.parcelle.create({ data: dto, include: includeParcelle });
    } catch (err) {
      console.error('[parcelles:create]', err);
      throw err;
    }
  });

  /** Met à jour une parcelle existante et la retourne avec ses cultures. */
  ipcMain.handle('parcelles:update', async (_event, dto: UpdateParcelleDto) => {
    try {
      const { id, ...data } = dto;
      return db.parcelle.update({ where: { id }, data, include: includeParcelle });
    } catch (err) {
      console.error('[parcelles:update]', err);
      throw err;
    }
  });

  /** Supprime une parcelle par son identifiant (cascade sur les cultures). */
  ipcMain.handle('parcelles:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.parcelle.delete({ where: { id } });
    } catch (err) {
      console.error('[parcelles:delete]', err);
      throw err;
    }
  });

  /**
   * Crée une nouvelle culture dans la parcelle indiquée.
   * Les tags sont créés ou rattachés via connectOrCreate.
   * Les dates ISO du DTO sont converties en objets Date avant persistance.
   */
  ipcMain.handle('cultures:create', async (_event, dto: CreateCultureDto) => {
    try {
      const { tags = [], dateSemisPrevue, dateRecoltePrevue, dateSemisReelle, dateRecolteReelle, ...data } = dto;
      return db.culture.create({
        data: {
          ...data,
          dateSemisPrevue:   toDate(dateSemisPrevue)!,
          dateRecoltePrevue: toDate(dateRecoltePrevue)!,
          dateSemisReelle:   toDate(dateSemisReelle),
          dateRecolteReelle: toDate(dateRecolteReelle),
          tags: { create: tags.map(libelle => ({ tag: { connectOrCreate: { where: { libelle }, create: { libelle } } } })) },
        },
        include: includeCulture,
      });
    } catch (err) {
      console.error('[cultures:create]', err);
      throw err;
    }
  });

  /**
   * Met à jour une culture existante.
   * Si des tags sont fournis, l'ancienne liste est entièrement remplacée (deleteMany + create).
   */
  ipcMain.handle('cultures:update', async (_event, dto: UpdateCultureDto) => {
    try {
      const { id, tags, dateSemisPrevue, dateRecoltePrevue, dateSemisReelle, dateRecolteReelle, ...data } = dto;
      return db.culture.update({
        where: { id },
        data: {
          ...data,
          ...(dateSemisPrevue   !== undefined && { dateSemisPrevue:   toDate(dateSemisPrevue)! }),
          ...(dateRecoltePrevue !== undefined && { dateRecoltePrevue: toDate(dateRecoltePrevue)! }),
          ...(dateSemisReelle   !== undefined && { dateSemisReelle:   toDate(dateSemisReelle) }),
          ...(dateRecolteReelle !== undefined && { dateRecolteReelle: toDate(dateRecolteReelle) }),
          ...(tags !== undefined && {
            tags: {
              deleteMany: {},
              create: tags.map(libelle => ({ tag: { connectOrCreate: { where: { libelle }, create: { libelle } } } })),
            },
          }),
        },
        include: includeCulture,
      });
    } catch (err) {
      console.error('[cultures:update]', err);
      throw err;
    }
  });

  /** Supprime une culture par son identifiant. */
  ipcMain.handle('cultures:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.culture.delete({ where: { id } });
    } catch (err) {
      console.error('[cultures:delete]', err);
      throw err;
    }
  });

  /** Enregistre une récolte pour la culture indiquée. */
  ipcMain.handle('recoltes:create', async (_event, dto: CreateRecolteDto) => {
    try {
      return db.recolte.create({ data: dto });
    } catch (err) {
      console.error('[recoltes:create]', err);
      throw err;
    }
  });

  /** Supprime une récolte par son identifiant. */
  ipcMain.handle('recoltes:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.recolte.delete({ where: { id } });
    } catch (err) {
      console.error('[recoltes:delete]', err);
      throw err;
    }
  });
}

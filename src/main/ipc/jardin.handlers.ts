import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateParcelleDto, UpdateParcelleDto, CreateCultureDto, UpdateCultureDto, CreateRecolteDto } from '../../shared/ipc/jardin.ipc';

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

const includeCulture = {
  plante:   true,
  statut:   true,
  tags:     { include: { tag: true } },
  recoltes: { orderBy: { date: 'asc' as const } },
};

function toDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(s);
}

export function registerJardinHandlers() {
  const db = getDb();

  ipcMain.handle('statutsCulture:getAll', async () => {
    return db.statutCulture.findMany({ orderBy: { libelle: 'asc' } });
  });

  ipcMain.handle('typesSol:getAll', async () => {
    return db.typeSol.findMany({ orderBy: { libelle: 'asc' } });
  });

  ipcMain.handle('tags:getAll', async () => {
    return db.tag.findMany({ orderBy: { libelle: 'asc' } });
  });

  ipcMain.handle('parcelles:getAll', async () => {
    return db.parcelle.findMany({
      include:  includeParcelle,
      orderBy:  { nom: 'asc' },
    });
  });

  ipcMain.handle('parcelles:create', async (_event, dto: CreateParcelleDto) => {
    return db.parcelle.create({
      data:    dto,
      include: includeParcelle,
    });
  });

  ipcMain.handle('parcelles:update', async (_event, dto: UpdateParcelleDto) => {
    const { id, ...data } = dto;
    return db.parcelle.update({
      where:   { id },
      data,
      include: includeParcelle,
    });
  });

  ipcMain.handle('parcelles:delete', async (_event, { id }: { id: number }) => {
    await db.parcelle.delete({ where: { id } });
  });

  ipcMain.handle('cultures:create', async (_event, dto: CreateCultureDto) => {
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
  });

  ipcMain.handle('cultures:update', async (_event, dto: UpdateCultureDto) => {
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
  });

  ipcMain.handle('cultures:delete', async (_event, { id }: { id: number }) => {
    await db.culture.delete({ where: { id } });
  });

  ipcMain.handle('recoltes:create', async (_event, dto: CreateRecolteDto) => {
    return db.recolte.create({ data: dto });
  });

  ipcMain.handle('recoltes:delete', async (_event, { id }: { id: number }) => {
    await db.recolte.delete({ where: { id } });
  });
}

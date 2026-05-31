import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateJournalDto, UpdateJournalDto } from '../../shared/ipc/journal.ipc';

const include = {
  culture: {
    include: {
      plante:   { select: { id: true, nom: true } },
      parcelle: { select: { id: true, nom: true } },
    },
  },
};

export function registerJournalHandlers() {
  const db = getDb();

  ipcMain.handle('journal:getAll', async () => {
    return db.journal.findMany({ include, orderBy: { date: 'desc' } });
  });

  ipcMain.handle('journal:getByCulture', async (_event, { cultureId }: { cultureId: number }) => {
    return db.journal.findMany({ where: { cultureId }, include, orderBy: { date: 'desc' } });
  });

  ipcMain.handle('journal:create', async (_event, dto: CreateJournalDto) => {
    const { date, ...rest } = dto;
    return db.journal.create({
      data: { ...rest, date: date ? new Date(date) : undefined },
      include,
    });
  });

  ipcMain.handle('journal:update', async (_event, dto: UpdateJournalDto) => {
    const { id, date, ...rest } = dto;
    return db.journal.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
      include,
    });
  });

  ipcMain.handle('journal:delete', async (_event, { id }: { id: number }) => {
    await db.journal.delete({ where: { id } });
  });
}

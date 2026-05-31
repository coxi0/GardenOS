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
    try {
      return db.journal.findMany({ include, orderBy: { date: 'desc' } });
    } catch (err) {
      console.error('[journal:getAll]', err);
      throw err;
    }
  });

  ipcMain.handle('journal:getByCulture', async (_event, { cultureId }: { cultureId: number }) => {
    try {
      return db.journal.findMany({ where: { cultureId }, include, orderBy: { date: 'desc' } });
    } catch (err) {
      console.error('[journal:getByCulture]', err);
      throw err;
    }
  });

  ipcMain.handle('journal:create', async (_event, dto: CreateJournalDto) => {
    try {
      const { date, ...rest } = dto;
      return db.journal.create({
        data: { ...rest, date: date ? new Date(date) : undefined },
        include,
      });
    } catch (err) {
      console.error('[journal:create]', err);
      throw err;
    }
  });

  ipcMain.handle('journal:update', async (_event, dto: UpdateJournalDto) => {
    try {
      const { id, date, ...rest } = dto;
      return db.journal.update({
        where: { id },
        data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
        include,
      });
    } catch (err) {
      console.error('[journal:update]', err);
      throw err;
    }
  });

  ipcMain.handle('journal:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.journal.delete({ where: { id } });
    } catch (err) {
      console.error('[journal:delete]', err);
      throw err;
    }
  });
}

import { ipcMain } from 'electron';
import { getDb } from '../services/db.service';
import type { CreateJournalDto, UpdateJournalDto } from '../../shared/ipc/journal.ipc';

/**
 * Fragment Prisma `include` pour une entrée de journal :
 * nom de la plante et de la parcelle de la culture associée.
 */
const include = {
  culture: {
    include: {
      plante:   { select: { id: true, nom: true } },
      parcelle: { select: { id: true, nom: true } },
    },
  },
};

/**
 * Enregistre tous les handlers IPC liés au journal de bord.
 * Couvre les opérations CRUD sur les entrées de journal.
 */
export function registerJournalHandlers() {
  const db = getDb();

  /** Retourne toutes les entrées de journal, triées de la plus récente à la plus ancienne. */
  ipcMain.handle('journal:getAll', async () => {
    try {
      return db.journal.findMany({ include, orderBy: { date: 'desc' } });
    } catch (err) {
      console.error('[journal:getAll]', err);
      throw err;
    }
  });

  /** Retourne les entrées de journal pour une culture donnée, les plus récentes en premier. */
  ipcMain.handle('journal:getByCulture', async (_event, { cultureId }: { cultureId: number }) => {
    try {
      return db.journal.findMany({ where: { cultureId }, include, orderBy: { date: 'desc' } });
    } catch (err) {
      console.error('[journal:getByCulture]', err);
      throw err;
    }
  });

  /** Crée une nouvelle entrée de journal. La date ISO du DTO est convertie en objet Date. */
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

  /** Met à jour le contenu et/ou la date d'une entrée de journal existante. */
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

  /** Supprime une entrée de journal par son identifiant. */
  ipcMain.handle('journal:delete', async (_event, { id }: { id: number }) => {
    try {
      await db.journal.delete({ where: { id } });
    } catch (err) {
      console.error('[journal:delete]', err);
      throw err;
    }
  });
}

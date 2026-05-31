import { Injectable } from '@angular/core';

/** Entrée complète du journal, avec culture, plante et parcelle résolues. */
export interface JournalEntry {
  id: number;
  date: string;
  contenu: string;
  cultureId: number;
  culture: {
    id: number;
    plante: { id: number; nom: string };
    parcelle: { id: number; nom: string };
  };
}

/** DTO de création : contenu obligatoire, culture liée, date optionnelle (défaut : now()). */
export interface CreateJournalDto {
  contenu: string;
  cultureId: number;
  date?: string;
}

/** DTO de mise à jour partielle : seuls les champs fournis sont modifiés. */
export interface UpdateJournalDto {
  id: number;
  contenu?: string;
  date?: string;
}

/**
 * Service Angular d'accès aux entrées du journal de bord.
 * Délègue toutes les opérations CRUD au processus principal Electron via IPC.
 */
@Injectable({ providedIn: 'root' })
export class JournalService {

  /** Retourne toutes les entrées du journal, triées par date décroissante. */
  getAll(): Promise<JournalEntry[]> {
    return window.electronAPI['journal:getAll']();
  }

  /** Retourne les entrées du journal pour une culture donnée. */
  getByCulture(cultureId: number): Promise<JournalEntry[]> {
    return window.electronAPI['journal:getByCulture']({ cultureId });
  }

  /** Crée une nouvelle entrée de journal. */
  create(dto: CreateJournalDto): Promise<JournalEntry> {
    return window.electronAPI['journal:create'](dto);
  }

  /** Met à jour une entrée de journal existante. */
  update(dto: UpdateJournalDto): Promise<JournalEntry> {
    return window.electronAPI['journal:update'](dto);
  }

  /** Supprime une entrée de journal par son identifiant. */
  delete(id: number): Promise<void> {
    return window.electronAPI['journal:delete']({ id });
  }
}

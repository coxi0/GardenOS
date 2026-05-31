/** Entrée du journal de bord telle que retournée par les handlers IPC. */
export interface JournalEntry {
  id: number;
  date: string;
  contenu: string;
  cultureId: number;
  culture: {
    id: number;
    plante:   { id: number; nom: string };
    parcelle: { id: number; nom: string };
  };
}

/** DTO de création d'une entrée de journal. */
export interface CreateJournalDto {
  contenu: string;
  cultureId: number;
  /** Date au format ISO 8601 ; si absente, la date du jour est utilisée. */
  date?: string;
}

/** DTO de mise à jour d'une entrée de journal (seul `id` est obligatoire). */
export interface UpdateJournalDto {
  id: number;
  contenu?: string;
  date?: string;
}

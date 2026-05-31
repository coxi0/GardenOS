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

export interface CreateJournalDto {
  contenu: string;
  cultureId: number;
  date?: string;
}

export interface UpdateJournalDto {
  id: number;
  contenu?: string;
  date?: string;
}

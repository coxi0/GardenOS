import { Injectable } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class JournalService {

  getAll(): Promise<JournalEntry[]> {
    return window.electronAPI['journal:getAll']();
  }

  getByCulture(cultureId: number): Promise<JournalEntry[]> {
    return window.electronAPI['journal:getByCulture']({ cultureId });
  }

  create(dto: CreateJournalDto): Promise<JournalEntry> {
    return window.electronAPI['journal:create'](dto);
  }

  update(dto: UpdateJournalDto): Promise<JournalEntry> {
    return window.electronAPI['journal:update'](dto);
  }

  delete(id: number): Promise<void> {
    return window.electronAPI['journal:delete']({ id });
  }
}

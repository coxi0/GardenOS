import { Injectable } from '@angular/core';

export interface TypePlante {
  id: number;
  libelle: string;
}

export interface Plante {
  id: number;
  nom: string;
  nomLatin: string | null;
  description: string | null;
  conseil: string | null;
  maladies: string | null;
  ensoleillement: string | null;
  moisSemisDebut: number;
  moisSemisFin: number;
  joursArrosage: number;
  joursMaturation: number;
  typePlanteId: number;
  typePlante?: TypePlante;
}

export interface CreatePlanteDto {
  nom: string;
  nomLatin?: string | null;
  description?: string | null;
  conseil?: string | null;
  maladies?: string | null;
  ensoleillement?: string | null;
  moisSemisDebut: number;
  moisSemisFin: number;
  joursArrosage: number;
  joursMaturation: number;
  typePlanteId: number;
}

export interface UpdatePlanteDto {
  id: number;
  nom?: string;
  nomLatin?: string | null;
  description?: string | null;
  conseil?: string | null;
  maladies?: string | null;
  ensoleillement?: string | null;
  moisSemisDebut?: number;
  moisSemisFin?: number;
  joursArrosage?: number;
  joursMaturation?: number;
  typePlanteId?: number;
}

@Injectable({ providedIn: 'root' })
export class PlanteService {

  // Chaque méthode délègue au main process via window.electronAPI.
  // Le preload (contextBridge) fait le pont entre Angular et Electron.

  getAll(): Promise<Plante[]> {
    return window.electronAPI['plantes:getAll']();
  }

  getTypePlantes(): Promise<TypePlante[]> {
    return window.electronAPI['typePlantes:getAll']();
  }

  create(dto: CreatePlanteDto): Promise<Plante> {
    return window.electronAPI['plantes:create'](dto);
  }

  update(dto: UpdatePlanteDto): Promise<Plante> {
    return window.electronAPI['plantes:update'](dto);
  }

  delete(id: number): Promise<void> {
    return window.electronAPI['plantes:delete']({ id });
  }
}

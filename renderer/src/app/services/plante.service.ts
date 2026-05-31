import { Injectable } from '@angular/core';

/** Type de plante (Légume, Aromatique, Fruit…). */
export interface TypePlante {
  id: number;
  libelle: string;
}

/** Plante du catalogue avec ses données agronomiques complètes. */
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

/** DTO de création d'une plante (tous les champs obligatoires doivent être présents). */
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

/** DTO de mise à jour partielle d'une plante (seuls les champs fournis sont modifiés). */
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

/**
 * Service Angular du catalogue de plantes.
 * Délègue toutes les opérations CRUD au processus principal Electron via IPC.
 */
@Injectable({ providedIn: 'root' })
export class PlanteService {

  /** Retourne toutes les plantes du catalogue, triées par nom. */
  getAll(): Promise<Plante[]> {
    return window.electronAPI['plantes:getAll']();
  }

  /** Retourne le nombre total de plantes dans le catalogue. */
  count(): Promise<number> {
    return window.electronAPI['plantes:count']();
  }

  /** Retourne tous les types de plante disponibles. */
  getTypePlantes(): Promise<TypePlante[]> {
    return window.electronAPI['typePlantes:getAll']();
  }

  /** Crée une nouvelle plante dans le catalogue. */
  create(dto: CreatePlanteDto): Promise<Plante> {
    return window.electronAPI['plantes:create'](dto);
  }

  /** Met à jour une plante existante. */
  update(dto: UpdatePlanteDto): Promise<Plante> {
    return window.electronAPI['plantes:update'](dto);
  }

  /** Supprime une plante du catalogue par son identifiant. */
  delete(id: number): Promise<void> {
    return window.electronAPI['plantes:delete']({ id });
  }
}

import { Injectable } from '@angular/core';
import type {
  ParcelleFull, CultureFull, Recolte, Tag, StatutCulture, TypeSol,
  CreateParcelleDto, UpdateParcelleDto,
  CreateCultureDto, UpdateCultureDto,
  CreateRecolteDto,
} from '../../../../src/shared/ipc/jardin.ipc';

export type { ParcelleFull, CultureFull, Recolte, Tag, StatutCulture, TypeSol };

/**
 * Service Angular du jardin : parcelles, cultures, récoltes, tags et référentiels.
 * Chaque méthode délègue au processus principal Electron via `window.electronAPI` (IPC).
 */
@Injectable({ providedIn: 'root' })
export class JardinService {

  /** Retourne toutes les parcelles avec leurs cultures complètes. */
  getParcelles(): Promise<ParcelleFull[]> {
    return window.electronAPI['parcelles:getAll']();
  }

  /** Crée une nouvelle parcelle dans le jardin. */
  createParcelle(dto: CreateParcelleDto): Promise<ParcelleFull> {
    return window.electronAPI['parcelles:create'](dto);
  }

  /** Met à jour une parcelle existante (nom, surface, position, type de sol…). */
  updateParcelle(dto: UpdateParcelleDto): Promise<ParcelleFull> {
    return window.electronAPI['parcelles:update'](dto);
  }

  /** Supprime une parcelle et toutes ses cultures associées (cascade). */
  deleteParcelle(id: number): Promise<void> {
    return window.electronAPI['parcelles:delete']({ id });
  }

  /** Crée une nouvelle culture dans une parcelle donnée. */
  createCulture(dto: CreateCultureDto): Promise<CultureFull> {
    return window.electronAPI['cultures:create'](dto);
  }

  /** Met à jour une culture existante (statut, dates, tags…). */
  updateCulture(dto: UpdateCultureDto): Promise<CultureFull> {
    return window.electronAPI['cultures:update'](dto);
  }

  /** Supprime une culture et ses récoltes associées (cascade). */
  deleteCulture(id: number): Promise<void> {
    return window.electronAPI['cultures:delete']({ id });
  }

  /** Enregistre une récolte pour une culture. */
  createRecolte(dto: CreateRecolteDto): Promise<Recolte> {
    return window.electronAPI['recoltes:create'](dto);
  }

  /** Supprime une récolte par son identifiant. */
  deleteRecolte(id: number): Promise<void> {
    return window.electronAPI['recoltes:delete']({ id });
  }

  /** Retourne tous les tags disponibles. */
  getTags(): Promise<Tag[]> {
    return window.electronAPI['tags:getAll']();
  }

  /** Retourne tous les statuts de culture disponibles. */
  getStatuts(): Promise<StatutCulture[]> {
    return window.electronAPI['statutsCulture:getAll']();
  }

  /** Retourne tous les types de sol disponibles. */
  getTypesSol(): Promise<TypeSol[]> {
    return window.electronAPI['typesSol:getAll']();
  }
}

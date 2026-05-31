import { Injectable } from '@angular/core';

/** Élément générique d'une table de référence (id + libellé). */
export interface RefItem {
  id: number;
  libelle: string;
}

/**
 * Service Angular d'accès aux tables de référence (listes de valeurs configurables).
 * Gère : TypePlante, TypeSol, StatutCulture, CategorieStock.
 * Chaque méthode délègue directement à l'API Electron via `window.electronAPI`.
 */
@Injectable({ providedIn: 'root' })
export class RefsService {
  /** Retourne tous les types de plante triés par libellé. */
  getTypesPlante()       { return window.electronAPI['typePlantes:getAll'](); }
  /** Crée un nouveau type de plante avec le libellé donné. */
  createTypePlante(l: string)    { return window.electronAPI['typePlantes:create']({ libelle: l }); }
  /** Supprime le type de plante identifié par son id. */
  deleteTypePlante(id: number)   { return window.electronAPI['typePlantes:delete']({ id }); }

  /** Retourne tous les types de sol triés par libellé. */
  getTypesSol()          { return window.electronAPI['typesSol:getAll'](); }
  /** Crée un nouveau type de sol avec le libellé donné. */
  createTypeSol(l: string)       { return window.electronAPI['typesSol:create']({ libelle: l }); }
  /** Supprime le type de sol identifié par son id. */
  deleteTypeSol(id: number)      { return window.electronAPI['typesSol:delete']({ id }); }

  /** Retourne tous les statuts de culture triés par libellé. */
  getStatutsCulture()    { return window.electronAPI['statutsCulture:getAll'](); }
  /** Crée un nouveau statut de culture avec le libellé donné. */
  createStatutCulture(l: string) { return window.electronAPI['statutsCulture:create']({ libelle: l }); }
  /** Supprime le statut de culture identifié par son id. */
  deleteStatutCulture(id: number){ return window.electronAPI['statutsCulture:delete']({ id }); }

  /** Retourne toutes les catégories de stock triées par libellé. */
  getCategoriesStock()   { return window.electronAPI['categoriesStock:getAll'](); }
  /** Crée une nouvelle catégorie de stock avec le libellé donné. */
  createCategorieStock(l: string){ return window.electronAPI['categoriesStock:create']({ libelle: l }); }
  /** Supprime la catégorie de stock identifiée par son id. */
  deleteCategorieStock(id: number){ return window.electronAPI['categoriesStock:delete']({ id }); }
}

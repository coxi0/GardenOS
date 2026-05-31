/** Élément de référentiel générique (type de plante, type de sol, statut, catégorie de stock). */
export interface RefItem {
  id: number;
  libelle: string;
}

/** DTO de création d'un élément de référentiel. */
export interface CreateRefDto {
  libelle: string;
}

import { Injectable } from '@angular/core';

/** Résultat d'une requête à l'API Wikipedia : titre, description courte et extrait. */
export interface WikiResultat {
  title: string;
  description: string | null;
  extract: string | null;
}

/**
 * Service d'accès à l'API REST Wikipedia (version française).
 * Utilisé pour pré-remplir la fiche d'une plante depuis Wikipedia lors de la création.
 */
@Injectable({ providedIn: 'root' })
export class WikipediaService {

  /**
   * Recherche le résumé Wikipedia d'une plante par son nom commun ou latin.
   * @param nom Terme de recherche (ex : "Tomate" ou "Solanum lycopersicum")
   * @returns Titre, description courte et extrait de l'article, ou null si introuvable
   */
  async rechercher(nom: string): Promise<WikiResultat | null> {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nom)}`;
    const res = await fetch(url);

    if (!res.ok) return null;

    const data = await res.json();
    return {
      title: data.title,
      description: data.description ?? null,
      extract: data.extract ?? null,
    };
  }

}

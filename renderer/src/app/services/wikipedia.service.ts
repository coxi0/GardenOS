import { Injectable } from '@angular/core';

/** Résultat d'une requête enrichie Wikipedia + Wikidata pour une plante. */
export interface WikiResultat {
  title: string;
  /** Nom scientifique (taxon P225 Wikidata), ou null si la plante regroupe plusieurs espèces. */
  nomLatin: string | null;
  /** Description courte retournée par Wikipedia. */
  description: string | null;
  /** Extrait long en texte libre. */
  extract: string | null;
}

/**
 * Service d'enrichissement de données plante via Wikipedia (FR) et Wikidata.
 * Flux : Wikipedia REST API → wikibase_item → Wikidata P225 (taxon name).
 */
@Injectable({ providedIn: 'root' })
export class WikipediaService {

  /**
   * Recherche les données d'une plante par son nom commun ou latin.
   * Le nom scientifique est récupéré depuis la propriété Wikidata P225 (taxon name).
   * @param nom Terme de recherche (ex : "Tomate", "Persil", "Matricaria chamomilla")
   * @returns Données enrichies ou null si la page est introuvable
   */
  async rechercher(nom: string): Promise<WikiResultat | null> {
    const wikiUrl = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nom)}`;
    const wikiRes = await fetch(wikiUrl);
    if (!wikiRes.ok) return null;

    const data = await wikiRes.json();

    // Si le titre est déjà un binôme latin (ex : recherche directe sur "Matricaria chamomilla")
    const titleIsBinomial = /^[A-Z][a-z]+ [a-z]+/.test(data.title ?? '');
    let nomLatin: string | null = titleIsBinomial ? data.title : null;

    // Sinon, interroge Wikidata pour la propriété P225 (taxon name)
    if (!nomLatin && data.wikibase_item) {
      nomLatin = await this.fetchTaxonName(data.wikibase_item);
    }

    return {
      title:       data.title,
      nomLatin,
      description: data.description ?? null,
      extract:     data.extract     ?? null,
    };
  }

  /**
   * Récupère la propriété P225 (taxon name) depuis l'API Wikidata.
   * Retourne null si l'entité n'est pas un taxon ou en cas d'erreur réseau.
   */
  private async fetchTaxonName(wikidataId: string): Promise<string | null> {
    try {
      const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json&origin=*`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const claims = data?.entities?.[wikidataId]?.claims;
      return claims?.P225?.[0]?.mainsnak?.datavalue?.value ?? null;
    } catch {
      return null;
    }
  }

}

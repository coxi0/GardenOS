import { Injectable } from '@angular/core';
import type { WikipediaResult } from '../../../../src/shared/ipc/plante.ipc';

/** Résultat d'une requête enrichie Wikipedia + Wikidata pour une plante. */
export type WikiResultat = WikipediaResult;

/**
 * Service d'enrichissement de données plante via Wikipedia (FR) et Wikidata.
 * L'appel réseau est effectué dans le processus principal Electron (handler IPC) :
 * le renderer ne communique qu'avec le preload, conformément à l'architecture Electron.
 */
@Injectable({ providedIn: 'root' })
export class WikipediaService {

  /**
   * Recherche les données d'une plante par son nom commun ou latin.
   * @param nom Terme de recherche (ex : "Tomate", "Matricaria chamomilla")
   * @returns Données enrichies ou null si la page est introuvable
   */
  rechercher(nom: string): Promise<WikiResultat | null> {
    return window.electronAPI['plantes:scrapeWikipedia']({ nom });
  }
}

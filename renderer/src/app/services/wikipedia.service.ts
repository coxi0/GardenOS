import { Injectable } from '@angular/core';

export interface WikiResultat {
  title: string;
  description: string | null;
  extract: string | null;
}

@Injectable({ providedIn: 'root' })
export class WikipediaService {

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

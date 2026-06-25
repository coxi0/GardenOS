/** Plante du catalogue telle que retournée par les handlers IPC. */
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
  typePlante?: { id: number; libelle: string };
}

/** Type de plante (ex. Légume, Fruit, Aromatique). */
export interface TypePlante {
  id: number;
  libelle: string;
}

/** DTO de création d'une plante. */
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

/** DTO de mise à jour d'une plante (seul `id` est obligatoire). */
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

/** Résultat d'une requête enrichie Wikipedia + Wikidata pour une plante. */
export interface WikipediaResult {
  title: string;
  /** Nom scientifique (taxon P225 Wikidata), ou null si indisponible. */
  nomLatin: string | null;
  /** Description courte retournée par Wikipedia. */
  description: string | null;
  /** Extrait long en texte libre. */
  extract: string | null;
}

/** Carte des canaux IPC du domaine Plante (types request/response par canal). */
export interface PlanteChannels {
  'plantes:getAll':          { request: void;             response: Plante[]              };
  'plantes:getById':         { request: { id: number };   response: Plante | null         };
  'plantes:count':           { request: void;             response: number                };
  'plantes:create':          { request: CreatePlanteDto;  response: Plante                };
  'plantes:update':          { request: UpdatePlanteDto;  response: Plante                };
  'plantes:delete':          { request: { id: number };   response: void                  };
  'plantes:scrapeWikipedia': { request: { nom: string };  response: WikipediaResult | null };
  'typePlantes:getAll':      { request: void;             response: TypePlante[]          };
}

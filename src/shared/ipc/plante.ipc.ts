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

export interface TypePlante {
  id: number;
  libelle: string;
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

export interface WikipediaResult {
  titre: string;
  description: string | null;
  extrait: string;
}

export interface PlanteChannels {
  'plantes:getAll':          { request: void;             response: Plante[]              };
  'plantes:getById':         { request: { id: number };   response: Plante | null         };
  'plantes:create':          { request: CreatePlanteDto;  response: Plante                };
  'plantes:update':          { request: UpdatePlanteDto;  response: Plante                };
  'plantes:delete':          { request: { id: number };   response: void                  };
  'plantes:scrapeWikipedia': { request: { nom: string };  response: WikipediaResult | null };
  'typePlantes:getAll':      { request: void;             response: TypePlante[]          };
}

export interface Tag {
  id: number;
  libelle: string;
}

export interface Recolte {
  id: number;
  date: string;
  quantite: number;
  unite: string;
  notes: string | null;
  cultureId: number;
}

export interface StatutCulture {
  id: number;
  libelle: string;
}

export interface TypeSol {
  id: number;
  libelle: string;
}

export interface CultureFull {
  id: number;
  dateSemisPrevue: string;
  dateRecoltePrevue: string;
  dateSemisReelle: string | null;
  dateRecolteReelle: string | null;
  notes: string | null;
  planteId: number;
  plante: { id: number; nom: string };
  parcelleId: number;
  statutId: number;
  statut: { id: number; libelle: string };
  tags: Tag[];
  recoltes: Recolte[];
}

export interface ParcelleFull {
  id: number;
  nom: string;
  superficie: number | null;
  exposition: string | null;
  notes: string | null;
  typeSolId: number | null;
  cultures: CultureFull[];
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateParcelleDto {
  nom: string;
  superficie?: number | null;
  exposition?: string | null;
  notes?: string | null;
  typeSolId?: number | null;
}

export interface UpdateParcelleDto {
  id: number;
  nom?: string;
  superficie?: number | null;
  exposition?: string | null;
  notes?: string | null;
  typeSolId?: number | null;
}

export interface CreateCultureDto {
  dateSemisPrevue: string;
  dateRecoltePrevue: string;
  dateSemisReelle?: string | null;
  dateRecolteReelle?: string | null;
  notes?: string | null;
  planteId: number;
  parcelleId: number;
  statutId: number;
  tags?: string[];  // libellés — créés à la volée si inexistants
}

export interface UpdateCultureDto {
  id: number;
  dateSemisPrevue?: string;
  dateRecoltePrevue?: string;
  dateSemisReelle?: string | null;
  dateRecolteReelle?: string | null;
  notes?: string | null;
  planteId?: number;
  parcelleId?: number;
  statutId?: number;
  tags?: string[];  // remplace tous les tags existants
}

export interface CreateRecolteDto {
  cultureId: number;
  quantite: number;
  unite: string;
  notes?: string | null;
}

// ── Canaux ────────────────────────────────────────────────────────────────────

export interface JardinChannels {
  'parcelles:getAll':       { request: void;               response: ParcelleFull[]  };
  'parcelles:create':       { request: CreateParcelleDto;  response: ParcelleFull    };
  'parcelles:update':       { request: UpdateParcelleDto;  response: ParcelleFull    };
  'parcelles:delete':       { request: { id: number };     response: void            };
  'cultures:create':        { request: CreateCultureDto;   response: CultureFull     };
  'cultures:update':        { request: UpdateCultureDto;   response: CultureFull     };
  'cultures:delete':        { request: { id: number };     response: void            };
  'recoltes:create':        { request: CreateRecolteDto;   response: Recolte         };
  'recoltes:delete':        { request: { id: number };     response: void            };
  'tags:getAll':            { request: void;               response: Tag[]           };
  'statutsCulture:getAll':  { request: void;               response: StatutCulture[] };
  'typesSol:getAll':        { request: void;               response: TypeSol[]       };
}

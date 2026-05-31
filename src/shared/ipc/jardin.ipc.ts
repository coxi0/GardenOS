/** Exposition solaire d'une parcelle. */
export type Exposition = 'PLEIN_SOLEIL' | 'MI_OMBRE' | 'OMBRE';

/** Tag associé à une culture. */
export interface Tag {
  id: number;
  libelle: string;
}

/** Récolte enregistrée pour une culture. */
export interface Recolte {
  id: number;
  date: string;
  quantite: number;
  unite: string;
  notes: string | null;
  cultureId: number;
}

/** Statut d'une culture (ex. Planifiée, En cours, Récoltée, Abandonnée). */
export interface StatutCulture {
  id: number;
  libelle: string;
}

/** Type de sol d'une parcelle (ex. Argileux, Sableux). */
export interface TypeSol {
  id: number;
  libelle: string;
}

/** Culture complète telle que retournée par les handlers IPC (relations incluses). */
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

/** Parcelle complète telle que retournée par les handlers IPC (cultures incluses). */
export interface ParcelleFull {
  id: number;
  nom: string;
  superficie: number | null;
  exposition: Exposition | null;
  notes: string | null;
  typeSolId: number | null;
  posX: number;
  posY: number;
  cultures: CultureFull[];
}

/** DTO de création d'une parcelle. */
export interface CreateParcelleDto {
  nom: string;
  superficie?: number | null;
  exposition?: Exposition | null;
  notes?: string | null;
  typeSolId?: number | null;
  posX?: number;
  posY?: number;
}

/** DTO de mise à jour d'une parcelle (seul `id` est obligatoire). */
export interface UpdateParcelleDto {
  id: number;
  nom?: string;
  superficie?: number | null;
  exposition?: Exposition | null;
  notes?: string | null;
  typeSolId?: number | null;
  posX?: number;
  posY?: number;
}

/** DTO de création d'une culture. Les dates sont transmises en chaînes ISO 8601. */
export interface CreateCultureDto {
  dateSemisPrevue: string;
  dateRecoltePrevue: string;
  dateSemisReelle?: string | null;
  dateRecolteReelle?: string | null;
  notes?: string | null;
  planteId: number;
  parcelleId: number;
  statutId: number;
  tags?: string[];
}

/** DTO de mise à jour d'une culture (seul `id` est obligatoire). */
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
  tags?: string[];
}

/** DTO de création d'une récolte. */
export interface CreateRecolteDto {
  cultureId: number;
  quantite: number;
  unite: string;
  notes?: string | null;
}

/** Carte des canaux IPC du domaine Jardin (types request/response par canal). */
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

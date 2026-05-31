/** Article de stock tel que retourné par les handlers IPC (catégorie et plante incluses). */
export interface StockItem {
  id: number;
  nom: string;
  quantite: number;
  unite: string;
  seuilAlerte: number | null;
  notes: string | null;
  categorieId: number;
  categorie?: { id: number; libelle: string };
  planteId: number | null;
  plante?: { id: number; nom: string };
}

/** Catégorie de stock (ex. Graines, Outils, Engrais). */
export interface CategorieStock {
  id: number;
  libelle: string;
}

/** DTO de création d'un article de stock. */
export interface CreateStockItemDto {
  nom: string;
  quantite: number;
  unite: string;
  seuilAlerte?: number | null;
  notes?: string | null;
  categorieId: number;
  planteId?: number | null;
}

/** DTO de mise à jour d'un article de stock (seul `id` est obligatoire). */
export interface UpdateStockItemDto {
  id: number;
  nom?: string;
  quantite?: number;
  unite?: string;
  seuilAlerte?: number | null;
  notes?: string | null;
  categorieId?: number;
  planteId?: number | null;
}

/** Carte des canaux IPC du domaine Stock (types request/response par canal). */
export interface StockChannels {
  'stocks:getAll':          { request: void;                  response: StockItem[]       };
  'stocks:getById':         { request: { id: number };        response: StockItem | null  };
  'stocks:create':          { request: CreateStockItemDto;    response: StockItem         };
  'stocks:update':          { request: UpdateStockItemDto;    response: StockItem         };
  'stocks:delete':          { request: { id: number };        response: void              };
  'categoriesStock:getAll': { request: void;                  response: CategorieStock[]  };
}

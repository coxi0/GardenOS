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

export interface CategorieStock {
  id: number;
  libelle: string;
}

export interface CreateStockItemDto {
  nom: string;
  quantite: number;
  unite: string;
  seuilAlerte?: number | null;
  notes?: string | null;
  categorieId: number;
  planteId?: number | null;
}

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

export interface StockChannels {
  'stocks:getAll':          { request: void;                  response: StockItem[]       };
  'stocks:getById':         { request: { id: number };        response: StockItem | null  };
  'stocks:create':          { request: CreateStockItemDto;    response: StockItem         };
  'stocks:update':          { request: UpdateStockItemDto;    response: StockItem         };
  'stocks:delete':          { request: { id: number };        response: void              };
  'categoriesStock:getAll': { request: void;                  response: CategorieStock[]  };
}

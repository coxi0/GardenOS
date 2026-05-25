import type { CreatePlanteDto, UpdatePlanteDto, Plante, TypePlante, WikipediaResult } from '../../src/shared/ipc/plante.ipc';
import type { StockItem, CategorieStock, CreateStockItemDto, UpdateStockItemDto } from '../../src/shared/ipc/stock.ipc';
// Déclare à TypeScript ce que le preload a exposé via contextBridge.
// Sans ce fichier, window.electronAPI serait de type "any" et on perdrait
// toute vérification de types sur les appels IPC.
declare global {
  interface Window {
    electronAPI: {
      'plantes:getAll':          ()                        => Promise<Plante[]>;
      'plantes:getById':         (data: { id: number })    => Promise<Plante | null>;
      'plantes:create':          (data: CreatePlanteDto)   => Promise<Plante>;
      'plantes:update':          (data: UpdatePlanteDto)   => Promise<Plante>;
      'plantes:delete':          (data: { id: number })    => Promise<void>;
      'plantes:scrapeWikipedia': (data: { nom: string })   => Promise<WikipediaResult | null>;
      'typePlantes:getAll':      ()                        => Promise<TypePlante[]>;
      'stocks:getAll':          ()                        => Promise<StockItem[]>;
      'stocks:getById':         (data: { id: number })    => Promise<StockItem | null>;
      'stocks:create':          (data: CreateStockItemDto) => Promise<StockItem>;
      'stocks:update':          (data: UpdateStockItemDto) => Promise<StockItem>;
      'stocks:delete':          (data: { id: number })    => Promise<void>;
      'categoriesStock:getAll': ()                        => Promise<CategorieStock[]>;
    };
  }
}

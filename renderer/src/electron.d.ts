import type { CreatePlanteDto, UpdatePlanteDto, Plante, TypePlante, WikipediaResult } from '../../src/shared/ipc/plante.ipc';
import type { JournalEntry, CreateJournalDto, UpdateJournalDto } from '../../src/shared/ipc/journal.ipc';
import type { StockItem, CategorieStock, CreateStockItemDto, UpdateStockItemDto } from '../../src/shared/ipc/stock.ipc';
import type { ParcelleFull, CultureFull, Recolte, Tag, StatutCulture, TypeSol, CreateParcelleDto, UpdateParcelleDto, CreateCultureDto, UpdateCultureDto, CreateRecolteDto } from '../../src/shared/ipc/jardin.ipc';
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
      'plantes:count':           ()                        => Promise<number>;
      'stocks:getAll':          ()                        => Promise<StockItem[]>;
      'stocks:getById':         (data: { id: number })    => Promise<StockItem | null>;
      'stocks:create':          (data: CreateStockItemDto) => Promise<StockItem>;
      'stocks:update':          (data: UpdateStockItemDto) => Promise<StockItem>;
      'stocks:delete':          (data: { id: number })    => Promise<void>;
      'categoriesStock:getAll': ()                        => Promise<CategorieStock[]>;
      'parcelles:getAll':       ()                        => Promise<ParcelleFull[]>;
      'parcelles:create':       (data: CreateParcelleDto) => Promise<ParcelleFull>;
      'parcelles:update':       (data: UpdateParcelleDto) => Promise<ParcelleFull>;
      'parcelles:delete':       (data: { id: number })    => Promise<void>;
      'cultures:create':        (data: CreateCultureDto)  => Promise<CultureFull>;
      'cultures:update':        (data: UpdateCultureDto)  => Promise<CultureFull>;
      'cultures:delete':        (data: { id: number })    => Promise<void>;
      'recoltes:create':        (data: CreateRecolteDto)  => Promise<Recolte>;
      'recoltes:delete':        (data: { id: number })    => Promise<void>;
      'tags:getAll':            ()                        => Promise<Tag[]>;
      'statutsCulture:getAll':    ()                          => Promise<StatutCulture[]>;
      'typesSol:getAll':          ()                          => Promise<TypeSol[]>;
      'typePlantes:create':       (data: { libelle: string }) => Promise<{ id: number; libelle: string }>;
      'typePlantes:delete':       (data: { id: number })      => Promise<void>;
      'typesSol:create':          (data: { libelle: string }) => Promise<{ id: number; libelle: string }>;
      'typesSol:delete':          (data: { id: number })      => Promise<void>;
      'statutsCulture:create':    (data: { libelle: string }) => Promise<{ id: number; libelle: string }>;
      'statutsCulture:delete':    (data: { id: number })      => Promise<void>;
      'categoriesStock:create':   (data: { libelle: string }) => Promise<{ id: number; libelle: string }>;
      'categoriesStock:delete':   (data: { id: number })      => Promise<void>;
      'journal:getAll':           ()                              => Promise<JournalEntry[]>;
      'journal:getByCulture':     (data: { cultureId: number })  => Promise<JournalEntry[]>;
      'journal:create':           (data: CreateJournalDto)        => Promise<JournalEntry>;
      'journal:update':           (data: UpdateJournalDto)        => Promise<JournalEntry>;
      'journal:delete':           (data: { id: number })          => Promise<void>;
    };
  }
}

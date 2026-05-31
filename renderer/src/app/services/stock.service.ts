import { Injectable } from '@angular/core';
import type { StockItem, CategorieStock, CreateStockItemDto, UpdateStockItemDto } from '../../../../src/shared/ipc/stock.ipc';

export type { StockItem, CategorieStock, CreateStockItemDto, UpdateStockItemDto };

/**
 * Service Angular d'accès au stock (graines, outils, engrais).
 * Délègue toutes les opérations CRUD au processus principal Electron via IPC.
 */
@Injectable({ providedIn: 'root' })
export class StockService {

  /** Retourne tous les articles en stock, triés par nom. */
  getAll(): Promise<StockItem[]> {
    return window.electronAPI['stocks:getAll']();
  }

  /** Retourne un article en stock par son identifiant, ou null s'il n'existe pas. */
  getById(id: number): Promise<StockItem | null> {
    return window.electronAPI['stocks:getById']({ id });
  }

  /** Retourne toutes les catégories de stock disponibles. */
  getCategories(): Promise<CategorieStock[]> {
    return window.electronAPI['categoriesStock:getAll']();
  }

  /** Crée un nouvel article en stock. */
  create(dto: CreateStockItemDto): Promise<StockItem> {
    return window.electronAPI['stocks:create'](dto);
  }

  /** Met à jour un article en stock existant. */
  update(dto: UpdateStockItemDto): Promise<StockItem> {
    return window.electronAPI['stocks:update'](dto);
  }

  /** Supprime un article en stock par son identifiant. */
  delete(id: number): Promise<void> {
    return window.electronAPI['stocks:delete']({ id });
  }
}

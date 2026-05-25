import { Injectable } from '@angular/core';
import type { StockItem, CategorieStock, CreateStockItemDto, UpdateStockItemDto } from '../../../../src/shared/ipc/stock.ipc';

export type { StockItem, CategorieStock, CreateStockItemDto, UpdateStockItemDto };

@Injectable({ providedIn: 'root' })
export class StockService {

  getAll(): Promise<StockItem[]> {
    return window.electronAPI['stocks:getAll']();
  }

  getById(id: number): Promise<StockItem | null> {
    return window.electronAPI['stocks:getById']({ id });
  }

  getCategories(): Promise<CategorieStock[]> {
    return window.electronAPI['categoriesStock:getAll']();
  }

  create(dto: CreateStockItemDto): Promise<StockItem> {
    return window.electronAPI['stocks:create'](dto);
  }

  update(dto: UpdateStockItemDto): Promise<StockItem> {
    return window.electronAPI['stocks:update'](dto);
  }

  delete(id: number): Promise<void> {
    return window.electronAPI['stocks:delete']({ id });
  }
}

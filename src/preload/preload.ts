import { contextBridge, ipcRenderer } from 'electron';
import type { CreatePlanteDto, UpdatePlanteDto } from '../shared/ipc/plante.ipc';
import type {CreateStockItemDto, UpdateStockItemDto} from '../shared/ipc/stock.ipc';

contextBridge.exposeInMainWorld('electronAPI', {
  'plantes:getAll':          ()                        => ipcRenderer.invoke('plantes:getAll'),
  'plantes:getById':         (data: { id: number })    => ipcRenderer.invoke('plantes:getById', data),
  'plantes:create':          (data: CreatePlanteDto)   => ipcRenderer.invoke('plantes:create', data),
  'plantes:update':          (data: UpdatePlanteDto)   => ipcRenderer.invoke('plantes:update', data),
  'plantes:delete':          (data: { id: number })    => ipcRenderer.invoke('plantes:delete', data),
  'plantes:scrapeWikipedia': (data: { nom: string })   => ipcRenderer.invoke('plantes:scrapeWikipedia', data),
  'typePlantes:getAll':      ()                        => ipcRenderer.invoke('typePlantes:getAll'),
  'stocks:getAll':          ()                        => ipcRenderer.invoke('stocks:getAll'),
  'stocks:getById':         (data: { id: number })    => ipcRenderer.invoke('stocks:getById', data),
  'stocks:create':          (data: CreateStockItemDto) => ipcRenderer.invoke('stocks:create', data),
  'stocks:update':          (data: UpdateStockItemDto) => ipcRenderer.invoke('stocks:update', data),
  'stocks:delete':          (data: { id: number })    => ipcRenderer.invoke('stocks:delete', data),
  'categoriesStock:getAll': ()                        => ipcRenderer.invoke('categoriesStock:getAll'),
});

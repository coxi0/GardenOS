import { contextBridge, ipcRenderer } from 'electron';
import type { CreatePlanteDto, UpdatePlanteDto } from '../shared/ipc/plante.ipc';

contextBridge.exposeInMainWorld('electronAPI', {
  'plantes:getAll':          ()                        => ipcRenderer.invoke('plantes:getAll'),
  'plantes:getById':         (data: { id: number })    => ipcRenderer.invoke('plantes:getById', data),
  'plantes:create':          (data: CreatePlanteDto)   => ipcRenderer.invoke('plantes:create', data),
  'plantes:update':          (data: UpdatePlanteDto)   => ipcRenderer.invoke('plantes:update', data),
  'plantes:delete':          (data: { id: number })    => ipcRenderer.invoke('plantes:delete', data),
  'plantes:scrapeWikipedia': (data: { nom: string })   => ipcRenderer.invoke('plantes:scrapeWikipedia', data),
  'typePlantes:getAll':      ()                        => ipcRenderer.invoke('typePlantes:getAll'),
});

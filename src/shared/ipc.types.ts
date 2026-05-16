// ─── Modèles de données ────────────────────────────────────────────────────────
// Ces types reflètent les modèles Prisma mais restent indépendants :
// le renderer Angular ne doit JAMAIS importer depuis @prisma/client.

export interface Garden {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Plant {
  id: number;
  name: string;
  species: string | null;
  plantedAt: Date;
  notes: string | null;
  gardenId: number;
}

// ─── DTOs (Data Transfer Objects) ──────────────────────────────────────────────
// Ce que le renderer envoie au main process pour créer/modifier des entités.

export interface CreateGardenDto {
  name: string;
  description?: string;
}

export interface CreatePlantDto {
  name: string;
  species?: string;
  notes?: string;
  gardenId: number;
}

export interface UpdatePlantDto {
  id: number;
  name?: string;
  species?: string;
  notes?: string;
}

// ─── Canaux IPC ────────────────────────────────────────────────────────────────
// Chaque canal a un type de requête (ce qu'envoie Angular)
// et un type de réponse (ce que renvoie le main process).
//
// Convention : 'domaine:action'
// void = pas de paramètre nécessaire

export interface IpcChannels {
  'gardens:getAll': { request: void;                  response: Garden[]        };
  'gardens:create': { request: CreateGardenDto;        response: Garden          };
  'gardens:delete': { request: { id: number };         response: void            };

  'plants:getAll':  { request: { gardenId: number };   response: Plant[]         };
  'plants:create':  { request: CreatePlantDto;          response: Plant           };
  'plants:update':  { request: UpdatePlantDto;          response: Plant           };
  'plants:delete':  { request: { id: number };          response: void            };
}

// ─── Helpers de typage ─────────────────────────────────────────────────────────
// Ces types utilitaires sont utilisés par le preload et le main process
// pour dériver automatiquement les bonnes signatures.

export type IpcChannel = keyof IpcChannels;

export type IpcRequest<C extends IpcChannel>  = IpcChannels[C]['request'];
export type IpcResponse<C extends IpcChannel> = IpcChannels[C]['response'];

// ─── Type de l'API exposée au renderer ─────────────────────────────────────────
// Ce type est ce que voit Angular via window.electronAPI.
// Si request = void → la fonction ne prend pas de paramètre.
// Sinon → elle prend le type de la requête.

export type ElectronAPI = {
  [C in IpcChannel]: IpcChannels[C]['request'] extends void
    ? () => Promise<IpcChannels[C]['response']>
    : (data: IpcChannels[C]['request']) => Promise<IpcChannels[C]['response']>;
};

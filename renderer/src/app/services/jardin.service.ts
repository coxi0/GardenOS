import { Injectable } from '@angular/core';
import type {
  ParcelleFull, CultureFull, Recolte, Tag, StatutCulture, TypeSol,
  CreateParcelleDto, UpdateParcelleDto,
  CreateCultureDto, UpdateCultureDto,
  CreateRecolteDto,
} from '../../../../src/shared/ipc/jardin.ipc';

export type { ParcelleFull, CultureFull, Recolte, Tag, StatutCulture, TypeSol };

@Injectable({ providedIn: 'root' })
export class JardinService {

  getParcelles(): Promise<ParcelleFull[]> {
    return window.electronAPI['parcelles:getAll']();
  }

  createParcelle(dto: CreateParcelleDto): Promise<ParcelleFull> {
    return window.electronAPI['parcelles:create'](dto);
  }

  updateParcelle(dto: UpdateParcelleDto): Promise<ParcelleFull> {
    return window.electronAPI['parcelles:update'](dto);
  }

  deleteParcelle(id: number): Promise<void> {
    return window.electronAPI['parcelles:delete']({ id });
  }

  createCulture(dto: CreateCultureDto): Promise<CultureFull> {
    return window.electronAPI['cultures:create'](dto);
  }

  updateCulture(dto: UpdateCultureDto): Promise<CultureFull> {
    return window.electronAPI['cultures:update'](dto);
  }

  deleteCulture(id: number): Promise<void> {
    return window.electronAPI['cultures:delete']({ id });
  }

  createRecolte(dto: CreateRecolteDto): Promise<Recolte> {
    return window.electronAPI['recoltes:create'](dto);
  }

  deleteRecolte(id: number): Promise<void> {
    return window.electronAPI['recoltes:delete']({ id });
  }

  getTags(): Promise<Tag[]> {
    return window.electronAPI['tags:getAll']();
  }

  getStatuts(): Promise<StatutCulture[]> {
    return window.electronAPI['statutsCulture:getAll']();
  }

  getTypesSol(): Promise<TypeSol[]> {
    return window.electronAPI['typesSol:getAll']();
  }
}

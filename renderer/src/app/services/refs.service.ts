import { Injectable } from '@angular/core';

export interface RefItem {
  id: number;
  libelle: string;
}

@Injectable({ providedIn: 'root' })
export class RefsService {
  getTypesPlante()       { return window.electronAPI['typePlantes:getAll'](); }
  createTypePlante(l: string)    { return window.electronAPI['typePlantes:create']({ libelle: l }); }
  deleteTypePlante(id: number)   { return window.electronAPI['typePlantes:delete']({ id }); }

  getTypesSol()          { return window.electronAPI['typesSol:getAll'](); }
  createTypeSol(l: string)       { return window.electronAPI['typesSol:create']({ libelle: l }); }
  deleteTypeSol(id: number)      { return window.electronAPI['typesSol:delete']({ id }); }

  getStatutsCulture()    { return window.electronAPI['statutsCulture:getAll'](); }
  createStatutCulture(l: string) { return window.electronAPI['statutsCulture:create']({ libelle: l }); }
  deleteStatutCulture(id: number){ return window.electronAPI['statutsCulture:delete']({ id }); }

  getCategoriesStock()   { return window.electronAPI['categoriesStock:getAll'](); }
  createCategorieStock(l: string){ return window.electronAPI['categoriesStock:create']({ libelle: l }); }
  deleteCategorieStock(id: number){ return window.electronAPI['categoriesStock:delete']({ id }); }
}

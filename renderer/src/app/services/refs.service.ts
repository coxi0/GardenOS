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

  getTypesAssociation()  { return window.electronAPI['typesAssociation:getAll'](); }
  createTypeAssociation(l: string) { return window.electronAPI['typesAssociation:create']({ libelle: l }); }
  deleteTypeAssociation(id: number){ return window.electronAPI['typesAssociation:delete']({ id }); }

  getStatutsCulture()    { return window.electronAPI['statutsCulture:getAll'](); }
  createStatutCulture(l: string) { return window.electronAPI['statutsCulture:create']({ libelle: l }); }
  deleteStatutCulture(id: number){ return window.electronAPI['statutsCulture:delete']({ id }); }

  getTypesAlerte()       { return window.electronAPI['typesAlerte:getAll'](); }
  createTypeAlerte(l: string)    { return window.electronAPI['typesAlerte:create']({ libelle: l }); }
  deleteTypeAlerte(id: number)   { return window.electronAPI['typesAlerte:delete']({ id }); }

  getCategoriesStock()   { return window.electronAPI['categoriesStock:getAll'](); }
  createCategorieStock(l: string){ return window.electronAPI['categoriesStock:create']({ libelle: l }); }
  deleteCategorieStock(id: number){ return window.electronAPI['categoriesStock:delete']({ id }); }
}

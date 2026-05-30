import { Component, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RefsService, RefItem } from '../../services/refs.service';

interface Section {
  label: string;
  items: RefItem[];
  libelle: string;
  getAll:  () => Promise<RefItem[]>;
  create:  (l: string) => Promise<RefItem>;
  delete:  (id: number) => Promise<void>;
}

@Component({
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.css',
  imports: [FormsModule],
})
export class ParametresComponent implements OnInit {
  private refs = inject(RefsService);

  sections: Section[] = [];

  ngOnInit() {
    this.sections = [
      { label: 'Types de plante',     items: [], libelle: '', getAll: () => this.refs.getTypesPlante(),       create: l => this.refs.createTypePlante(l),       delete: id => this.refs.deleteTypePlante(id)       },
      { label: 'Types de sol',        items: [], libelle: '', getAll: () => this.refs.getTypesSol(),          create: l => this.refs.createTypeSol(l),          delete: id => this.refs.deleteTypeSol(id)          },
      { label: "Types d'association", items: [], libelle: '', getAll: () => this.refs.getTypesAssociation(),  create: l => this.refs.createTypeAssociation(l),  delete: id => this.refs.deleteTypeAssociation(id)  },
      { label: 'Statuts de culture',  items: [], libelle: '', getAll: () => this.refs.getStatutsCulture(),    create: l => this.refs.createStatutCulture(l),    delete: id => this.refs.deleteStatutCulture(id)    },
      { label: "Types d'alerte",      items: [], libelle: '', getAll: () => this.refs.getTypesAlerte(),       create: l => this.refs.createTypeAlerte(l),       delete: id => this.refs.deleteTypeAlerte(id)       },
      { label: 'Catégories de stock', items: [], libelle: '', getAll: () => this.refs.getCategoriesStock(),   create: l => this.refs.createCategorieStock(l),   delete: id => this.refs.deleteCategorieStock(id)   },
    ];
    this.chargerTout();
  }

  async chargerTout() {
    await Promise.all(this.sections.map(async s => s.items = await s.getAll()));
  }

  async ajouter(s: Section) {
    const val = s.libelle.trim();
    if (!val) return;
    await s.create(val);
    s.libelle = '';
    s.items = await s.getAll();
  }

  async supprimer(s: Section, id: number) {
    await s.delete(id);
    s.items = await s.getAll();
  }
}

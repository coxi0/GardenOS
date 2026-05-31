import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RefsService, RefItem } from '../../services/refs.service';

/**
 * Représente une section de référentiel dans l'écran Paramètres.
 * Encapsule le libellé, les items chargés et les opérations CRUD associées.
 */
interface Section {
  label: string;
  items: RefItem[];
  libelle: string;
  getAll:  () => Promise<RefItem[]>;
  create:  (l: string) => Promise<RefItem>;
  delete:  (id: number) => Promise<void>;
}

/**
 * Composant de gestion des tables de référence (valeurs configurables de l'application).
 * Permet d'ajouter et supprimer des TypePlante, TypeSol, StatutCulture et CategorieStock.
 * Utilise ChangeDetectorRef car les tableaux d'items sont mutés directement dans des objets plain.
 */
@Component({
  standalone: true,
  selector: 'app-parametres',
  templateUrl: './parametres.component.html',
  styleUrl: './parametres.component.css',
  imports: [FormsModule],
})
export class ParametresComponent implements OnInit {
  private refs = inject(RefsService);
  private cdr  = inject(ChangeDetectorRef);

  /** Sections de référentiels à afficher, initialisées dans ngOnInit. */
  sections: Section[] = [];

  /** Initialise les sections et déclenche le chargement initial de toutes les listes. */
  ngOnInit() {
    this.sections = [
      { label: 'Types de plante',     items: [], libelle: '', getAll: () => this.refs.getTypesPlante(),       create: l => this.refs.createTypePlante(l),       delete: id => this.refs.deleteTypePlante(id)       },
      { label: 'Types de sol',        items: [], libelle: '', getAll: () => this.refs.getTypesSol(),        create: l => this.refs.createTypeSol(l),        delete: id => this.refs.deleteTypeSol(id)        },
      { label: 'Statuts de culture',  items: [], libelle: '', getAll: () => this.refs.getStatutsCulture(),  create: l => this.refs.createStatutCulture(l),  delete: id => this.refs.deleteStatutCulture(id)  },
      { label: 'Catégories de stock', items: [], libelle: '', getAll: () => this.refs.getCategoriesStock(), create: l => this.refs.createCategorieStock(l), delete: id => this.refs.deleteCategorieStock(id) },
    ];
    this.chargerTout();
  }

  /** Charge en parallèle les items de toutes les sections. */
  async chargerTout() {
    try {
      await Promise.all(this.sections.map(async s => s.items = await s.getAll()));
      this.cdr.detectChanges();
    } catch (err) {
      console.error('[parametres:chargerTout]', err);
    }
  }

  /** Crée un nouvel item dans la section donnée puis recharge sa liste. */
  async ajouter(s: Section) {
    const val = s.libelle.trim();
    if (!val) return;
    try {
      await s.create(val);
      s.libelle = '';
      s.items = await s.getAll();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('[parametres:ajouter]', err);
    }
  }

  /** Supprime l'item identifié dans la section donnée puis recharge sa liste. */
  async supprimer(s: Section, id: number) {
    try {
      await s.delete(id);
      s.items = await s.getAll();
      this.cdr.detectChanges();
    } catch (err) {
      console.error('[parametres:supprimer]', err);
    }
  }
}

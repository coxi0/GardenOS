import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { StockItem, CategorieStock, StockService } from '../../services/stock.service';
import { PlanteService } from '../../services/plante.service';
import type { Plante } from '../../services/plante.service';

/**
 * Composant de gestion du stock (graines, outils, engrais, engrais…).
 * Affiche la liste filtrée par nom et catégorie, gère les opérations CRUD
 * et avertit en console via effect() lorsqu'un article est épuisé (quantité = 0).
 */
@Component({
  standalone: true,
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
})
export class StockComponent implements OnInit {

  private stockService  = inject(StockService);
  private planteService = inject(PlanteService);

  stocks     = signal<StockItem[]>([]);
  categories = signal<CategorieStock[]>([]);
  plantes    = signal<Plante[]>([]);

  /** Charge en parallèle les stocks, catégories et plantes au démarrage du composant. */
  async ngOnInit() {
    try {
      const [stocks, categories, plantes] = await Promise.all([
        this.stockService.getAll(),
        this.stockService.getCategories(),
        this.planteService.getAll(),
      ]);
      this.stocks.set(stocks);
      this.categories.set(categories);
      this.plantes.set(plantes);
    } catch (err) {
      console.error('[stock:ngOnInit]', err);
    }
  }

  recherche       = signal('');
  filtreCategorie = signal<number | null>(null);

  constructor() {
    /** Avertit en console lorsque des articles sont épuisés (réactif aux changements du signal stocks). */
    effect(() => {
      const epuises = this.stocks().filter(s => s.quantite === 0);
      if (epuises.length > 0)
        console.warn(`[stock] ${epuises.length} article(s) épuisé(s).`);
    });
  }

  /** Liste filtrée par terme de recherche et catégorie sélectionnée. */
  stocksFiltres = computed(() => {
    const terme = this.recherche().toLowerCase();
    const cat   = this.filtreCategorie();
    return this.stocks().filter(s => {
      const matchNom = !terme || s.nom.toLowerCase().includes(terme);
      const matchCat = cat === null || s.categorieId === cat;
      return matchNom && matchCat;
    });
  });

  modalOuvert  = signal(false);
  modeEdition  = signal(false);
  formStock    = signal<Partial<StockItem>>({});

  /** Initialise le formulaire pour l'ajout d'un nouvel article et ouvre la modale. */
  ouvrirAjout() {
    this.formStock.set({
      quantite:    0,
      seuilAlerte: null,
      planteId:    null,
      categorieId: this.categories()[0]?.id,
    });
    this.modeEdition.set(false);
    this.modalOuvert.set(true);
  }

  /** Pré-remplit le formulaire avec les données de l'article à éditer et ouvre la modale. */
  ouvrirEdition(item: StockItem) {
    this.formStock.set({ ...item });
    this.modeEdition.set(true);
    this.modalOuvert.set(true);
  }

  /** Ferme la modale et réinitialise le formulaire. */
  fermerModal() {
    this.modalOuvert.set(false);
    this.formStock.set({});
  }

  /** Crée ou met à jour l'article en stock selon le mode du formulaire. */
  async sauvegarder() {
    const form = this.formStock();
    if (!form.nom || !form.categorieId) return;
    try {
      if (this.modeEdition()) {
        const updated = await this.stockService.update({
          id:          form.id!,
          nom:         form.nom,
          quantite:    form.quantite,
          unite:       form.unite,
          seuilAlerte: form.seuilAlerte,
          notes:       form.notes,
          categorieId: form.categorieId,
          planteId:    form.planteId,
        });
        this.stocks.update(liste => liste.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await this.stockService.create({
          nom:         form.nom,
          quantite:    form.quantite ?? 0,
          unite:       form.unite ?? 'unité',
          seuilAlerte: form.seuilAlerte,
          notes:       form.notes,
          categorieId: form.categorieId,
          planteId:    form.planteId,
        });
        this.stocks.update(liste => [...liste, created]);
      }
      this.fermerModal();
    } catch (err) {
      console.error('[stock:sauvegarder]', err);
    }
  }

  /** Supprime un article du stock par son identifiant. */
  async supprimer(id: number) {
    try {
      await this.stockService.delete(id);
      this.stocks.update(liste => liste.filter(s => s.id !== id));
    } catch (err) {
      console.error('[stock:supprimer]', err);
    }
  }

  /** Retourne true si la quantité de l'article est inférieure ou égale à son seuil d'alerte. */
  enAlerte(item: StockItem): boolean {
    return item.seuilAlerte !== null && item.quantite <= item.seuilAlerte;
  }
}

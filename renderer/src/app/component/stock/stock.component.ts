import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { StockItem, CategorieStock, StockService } from '../../services/stock.service';
import { PlanteService } from '../../services/plante.service';
import type { Plante } from '../../services/plante.service';

@Component({
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

  async ngOnInit() {
    const [stocks, categories, plantes] = await Promise.all([
      this.stockService.getAll(),
      this.stockService.getCategories(),
      this.planteService.getAll(),
    ]);
    this.stocks.set(stocks);
    this.categories.set(categories);
    this.plantes.set(plantes);
  }

  recherche       = signal('');
  filtreCategorie = signal<number | null>(null);

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

  ouvrirEdition(item: StockItem) {
    this.formStock.set({ ...item });
    this.modeEdition.set(true);
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
    this.formStock.set({});
  }

  async sauvegarder() {
    const form = this.formStock();
    if (!form.nom || !form.categorieId) return;

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
  }

  async supprimer(id: number) {
    await this.stockService.delete(id);
    this.stocks.update(liste => liste.filter(s => s.id !== id));
  }

  enAlerte(item: StockItem): boolean {
    return item.seuilAlerte !== null && item.quantite <= item.seuilAlerte;
  }
}

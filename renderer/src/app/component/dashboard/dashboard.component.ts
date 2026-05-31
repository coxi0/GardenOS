import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { JardinService, ParcelleFull, CultureFull } from '../../services/jardin.service';
import { StockService, StockItem } from '../../services/stock.service';
import { PlanteService } from '../../services/plante.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  imports: [],
})
export class DashboardComponent implements OnInit {

  private jardinService = inject(JardinService);
  private stockService  = inject(StockService);
  private planteService = inject(PlanteService);

  parcelles    = signal<ParcelleFull[]>([]);
  stocks       = signal<StockItem[]>([]);
  totalPlantes = signal<number>(0);

  async ngOnInit() {
    const [parcelles, stocks, totalPlantes] = await Promise.all([
      this.jardinService.getParcelles(),
      this.stockService.getAll(),
      this.planteService.count(),
    ]);
    this.parcelles.set(parcelles);
    this.stocks.set(stocks);
    this.totalPlantes.set(totalPlantes);
  }

  cultures = computed(() =>
    this.parcelles().flatMap(p => p.cultures)
  );

  totalRecoltes = computed(() =>
    this.cultures().reduce((sum, c) => sum + c.recoltes.length, 0)
  );

  alertes = computed(() =>
    this.stocks().filter(s => s.seuilAlerte !== null && s.quantite <= s.seuilAlerte)
  );

  parStatut = computed(() => {
    const statuts = ['Planifiée', 'En cours', 'Récoltée', 'Abandonnée'];
    return statuts.map(libelle => ({
      libelle,
      cultures: this.cultures().filter(c => c.statut.libelle === libelle),
    }));
  });

  private today = new Date();
  private todayTime = this.today.getTime();

  prochainsSevis = computed(() =>
    this.cultures()
      .filter(c => !c.dateSemisReelle && new Date(c.dateSemisPrevue).getTime() >= this.todayTime)
      .sort((a, b) => new Date(a.dateSemisPrevue).getTime() - new Date(b.dateSemisPrevue).getTime())
      .slice(0, 5)
  );

  prochainesRecoltes = computed(() =>
    this.cultures()
      .filter(c => !c.dateRecolteReelle && new Date(c.dateRecoltePrevue).getTime() >= this.todayTime)
      .sort((a, b) => new Date(a.dateRecoltePrevue).getTime() - new Date(b.dateRecoltePrevue).getTime())
      .slice(0, 5)
  );

  parcellePour(culture: CultureFull): string {
    return this.parcelles().find(p => p.cultures.some(c => c.id === culture.id))?.nom ?? '';
  }

  couleurStatut(libelle: string): string {
    switch (libelle) {
      case 'Planifiée':  return 'statut-planifiee';
      case 'En cours':   return 'statut-en-cours';
      case 'Récoltée':   return 'statut-recoltee';
      case 'Abandonnée': return 'statut-abandonnee';
      default:           return '';
    }
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}

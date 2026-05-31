import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { JardinService, ParcelleFull, CultureFull } from '../../services/jardin.service';
import { StockService, StockItem } from '../../services/stock.service';
import { PlanteService } from '../../services/plante.service';

/**
 * Composant du tableau de bord.
 * Agrège les données de toutes les parcelles, cultures et stocks pour offrir
 * une vue synthétique : compteurs, répartition par statut,
 * prochains semis/récoltes et alertes de stock bas.
 */
@Component({
  standalone: true,
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

  constructor() {
    /** Avertit en console lorsque des articles de stock sont sous leur seuil d'alerte. */
    effect(() => {
      const nb = this.alertes().length;
      if (nb > 0) console.warn(`[dashboard] ${nb} article(s) en stock sous le seuil d'alerte.`);
    });
  }

  /** Charge en parallèle les parcelles, le stock et le nombre de plantes au démarrage. */
  async ngOnInit() {
    try {
      const [parcelles, stocks, totalPlantes] = await Promise.all([
        this.jardinService.getParcelles(),
        this.stockService.getAll(),
        this.planteService.count(),
      ]);
      this.parcelles.set(parcelles);
      this.stocks.set(stocks);
      this.totalPlantes.set(totalPlantes);
    } catch (err) {
      console.error('[dashboard:ngOnInit]', err);
    }
  }

  /** Liste aplatie de toutes les cultures issues de toutes les parcelles. */
  cultures = computed(() =>
    this.parcelles().flatMap(p => p.cultures)
  );

  /** Nombre total de récoltes enregistrées sur toutes les cultures. */
  totalRecoltes = computed(() =>
    this.cultures().reduce((sum, c) => sum + c.recoltes.length, 0)
  );

  /** Articles en stock dont la quantité est inférieure ou égale au seuil d'alerte. */
  alertes = computed(() =>
    this.stocks().filter(s => s.seuilAlerte !== null && s.quantite <= s.seuilAlerte)
  );

  /** Cultures regroupées par statut (Planifiée, En cours, Récoltée, Abandonnée). */
  parStatut = computed(() => {
    const statuts = ['Planifiée', 'En cours', 'Récoltée', 'Abandonnée'];
    return statuts.map(libelle => ({
      libelle,
      cultures: this.cultures().filter(c => c.statut.libelle === libelle),
    }));
  });

  private today = new Date();
  private todayTime = this.today.getTime();

  /** Prochains semis prévus non encore réalisés, triés par date (5 premiers). */
  prochainsSevis = computed(() =>
    this.cultures()
      .filter(c => !c.dateSemisReelle && new Date(c.dateSemisPrevue).getTime() >= this.todayTime)
      .sort((a, b) => new Date(a.dateSemisPrevue).getTime() - new Date(b.dateSemisPrevue).getTime())
      .slice(0, 5)
  );

  /** Prochaines récoltes prévues non encore réalisées, triées par date (5 premières). */
  prochainesRecoltes = computed(() =>
    this.cultures()
      .filter(c => !c.dateRecolteReelle && new Date(c.dateRecoltePrevue).getTime() >= this.todayTime)
      .sort((a, b) => new Date(a.dateRecoltePrevue).getTime() - new Date(b.dateRecoltePrevue).getTime())
      .slice(0, 5)
  );

  /** Retourne le nom de la parcelle qui contient la culture donnée. */
  parcellePour(culture: CultureFull): string {
    return this.parcelles().find(p => p.cultures.some(c => c.id === culture.id))?.nom ?? '';
  }

  /** Retourne la classe CSS correspondant au statut d'une culture. */
  couleurStatut(libelle: string): string {
    switch (libelle) {
      case 'Planifiée':  return 'statut-planifiee';
      case 'En cours':   return 'statut-en-cours';
      case 'Récoltée':   return 'statut-recoltee';
      case 'Abandonnée': return 'statut-abandonnee';
      default:           return '';
    }
  }

  /** Formate une date ISO en date française courte, ou retourne "—" si null. */
  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}

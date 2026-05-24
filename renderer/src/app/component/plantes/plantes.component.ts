import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { WikipediaService, WikiResultat } from '../../services/wikipedia.service';
import { Plante, PlanteService, TypePlante } from '../../services/plante.service';

@Component({
  selector: 'app-plantes',
  templateUrl: './plantes.component.html',
  styleUrl: './plantes.component.css',
})
export class PlantesComponent implements OnInit {

  private planteService = inject(PlanteService);
  private wikipedia = inject(WikipediaService);

  // ── Wikipedia ────────────────────────────────────────────────────────────────
  wikiRecherche = signal('');
  wikiChargement = signal(false);
  wikiResultat = signal<WikiResultat | null>(null);
  wikiErreur = signal<string | null>(null);

  async rechercherWikipedia() {
    const terme = this.wikiRecherche();
    if (!terme) return;

    this.wikiChargement.set(true);
    this.wikiErreur.set(null);
    this.wikiResultat.set(null);

    try {
      const resultat = await this.wikipedia.rechercher(terme);
      if (!resultat) {
        this.wikiErreur.set('Plante non trouvée sur Wikipedia.');
        return;
      }
      this.wikiResultat.set(resultat);
      this.formPlante.update(f => ({
        ...f,
        nom: resultat.title,
        nomLatin: resultat.description ?? f.nomLatin,
        description: resultat.extract ?? f.description,
      }));
    } catch {
      this.wikiErreur.set('Erreur de connexion à Wikipedia.');
    } finally {
      this.wikiChargement.set(false);
    }
  }

  // ── Données ──────────────────────────────────────────────────────────────────
  plantes = signal<Plante[]>([]);
  typePlantes = signal<TypePlante[]>([]);

  async ngOnInit() {
    const [plantes, types] = await Promise.all([
      this.planteService.getAll(),
      this.planteService.getTypePlantes(),
    ]);
    this.plantes.set(plantes);
    this.typePlantes.set(types);
  }

  // ── Recherche ────────────────────────────────────────────────────────────────
  recherche = signal('');

  plantesFiltrees = computed(() => {
    const terme = this.recherche().toLowerCase();
    if (!terme) return this.plantes();
    return this.plantes().filter(p =>
      p.nom.toLowerCase().includes(terme) ||
      (p.nomLatin?.toLowerCase().includes(terme) ?? false) ||
      (p.typePlante?.libelle.toLowerCase().includes(terme) ?? false)
    );
  });

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalOuvert = signal(false);
  modeEdition = signal(false);
  formPlante = signal<Partial<Plante>>({});

  ouvrirAjout() {
    this.wikiRecherche.set('');
    this.wikiResultat.set(null);
    this.wikiErreur.set(null);
    this.formPlante.set({
      moisSemisDebut: 1,
      moisSemisFin: 12,
      joursArrosage: 3,
      joursMaturation: 60,
      typePlanteId: this.typePlantes()[0]?.id ?? 1,
    });
    this.modeEdition.set(false);
    this.modalOuvert.set(true);
  }

  ouvrirEdition(plante: Plante) {
    this.wikiRecherche.set('');
    this.wikiResultat.set(null);
    this.wikiErreur.set(null);
    this.formPlante.set({ ...plante });
    this.modeEdition.set(true);
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
    this.formPlante.set({});
  }

  async sauvegarder() {
    const form = this.formPlante();
    if (!form.nom || !form.typePlanteId) return;

    if (this.modeEdition()) {
      const updated = await this.planteService.update({
        id: form.id!,
        nom: form.nom,
        nomLatin: form.nomLatin,
        description: form.description,
        conseil: form.conseil,
        maladies: form.maladies,
        ensoleillement: form.ensoleillement,
        moisSemisDebut: form.moisSemisDebut,
        moisSemisFin: form.moisSemisFin,
        joursArrosage: form.joursArrosage,
        joursMaturation: form.joursMaturation,
        typePlanteId: form.typePlanteId,
      });
      this.plantes.update(liste => liste.map(p => p.id === updated.id ? updated : p));
    } else {
      const created = await this.planteService.create({
        nom: form.nom,
        nomLatin: form.nomLatin,
        description: form.description,
        conseil: form.conseil,
        maladies: form.maladies,
        ensoleillement: form.ensoleillement,
        moisSemisDebut: form.moisSemisDebut ?? 1,
        moisSemisFin: form.moisSemisFin ?? 12,
        joursArrosage: form.joursArrosage ?? 3,
        joursMaturation: form.joursMaturation ?? 60,
        typePlanteId: form.typePlanteId,
      });
      this.plantes.update(liste => [...liste, created]);
    }

    this.fermerModal();
  }

  async supprimer(id: number) {
    await this.planteService.delete(id);
    this.plantes.update(liste => liste.filter(p => p.id !== id));
  }
}

import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WikipediaService, WikiResultat } from '../../services/wikipedia.service';
import { Plante, PlanteService, TypePlante } from '../../services/plante.service';
import { PlanteCardComponent } from './plante-card/plante-card.component';

@Component({
  standalone: true,
  selector: 'app-plantes',
  templateUrl: './plantes.component.html',
  styleUrl: './plantes.component.css',
  imports: [PlanteCardComponent, ReactiveFormsModule],
})
export class PlantesComponent implements OnInit {

  private planteService = inject(PlanteService);
  private wikipedia     = inject(WikipediaService);
  private fb            = inject(FormBuilder);

  form = this.fb.group({
    nom:             ['',   Validators.required],
    nomLatin:        [null as string | null],
    typePlanteId:    [null as number | null, Validators.required],
    ensoleillement:  [null as string | null],
    description:     [null as string | null],
    conseil:         [null as string | null],
    maladies:        [null as string | null],
    moisSemisDebut:  [1,   Validators.required],
    moisSemisFin:    [12,  Validators.required],
    joursArrosage:   [3,   Validators.required],
    joursMaturation: [60,  Validators.required],
  });

  wikiRecherche  = signal('');
  wikiChargement = signal(false);
  wikiResultat   = signal<WikiResultat | null>(null);
  wikiErreur     = signal<string | null>(null);

  plantes    = signal<Plante[]>([]);
  typePlantes = signal<TypePlante[]>([]);
  modalOuvert = signal(false);
  modeEdition = signal(false);
  private editId = signal<number | null>(null);

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

  async ngOnInit() {
    try {
      const [plantes, types] = await Promise.all([
        this.planteService.getAll(),
        this.planteService.getTypePlantes(),
      ]);
      this.plantes.set(plantes);
      this.typePlantes.set(types);
    } catch (err) {
      console.error('[plantes:ngOnInit]', err);
    }
  }

  async rechercherWikipedia() {
    const terme = this.wikiRecherche();
    if (!terme) return;
    this.wikiChargement.set(true);
    this.wikiErreur.set(null);
    this.wikiResultat.set(null);
    try {
      const resultat = await this.wikipedia.rechercher(terme);
      if (!resultat) { this.wikiErreur.set('Plante non trouvée sur Wikipedia.'); return; }
      this.wikiResultat.set(resultat);
      this.form.patchValue({
        nom:         resultat.title,
        nomLatin:    resultat.description ?? null,
        description: resultat.extract     ?? null,
      });
    } catch {
      this.wikiErreur.set('Erreur de connexion à Wikipedia.');
    } finally {
      this.wikiChargement.set(false);
    }
  }

  ouvrirAjout() {
    this.resetWiki();
    this.form.reset({
      nom: '', nomLatin: null, typePlanteId: this.typePlantes()[0]?.id ?? null,
      ensoleillement: null, description: null, conseil: null, maladies: null,
      moisSemisDebut: 1, moisSemisFin: 12, joursArrosage: 3, joursMaturation: 60,
    });
    this.editId.set(null);
    this.modeEdition.set(false);
    this.modalOuvert.set(true);
  }

  ouvrirEdition(plante: Plante) {
    this.resetWiki();
    this.form.patchValue({
      nom: plante.nom, nomLatin: plante.nomLatin ?? null,
      typePlanteId: plante.typePlanteId, ensoleillement: plante.ensoleillement ?? null,
      description: plante.description ?? null, conseil: plante.conseil ?? null,
      maladies: plante.maladies ?? null, moisSemisDebut: plante.moisSemisDebut,
      moisSemisFin: plante.moisSemisFin, joursArrosage: plante.joursArrosage,
      joursMaturation: plante.joursMaturation,
    });
    this.editId.set(plante.id);
    this.modeEdition.set(true);
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
    this.form.reset();
  }

  async sauvegarder() {
    if (this.form.invalid) return;
    const val = this.form.value as Required<typeof this.form.value>;
    try {
      if (this.modeEdition()) {
        const updated = await this.planteService.update({
          id: this.editId()!,
          nom: val.nom ?? undefined, nomLatin: val.nomLatin ?? undefined,
          description: val.description ?? undefined, conseil: val.conseil ?? undefined,
          maladies: val.maladies ?? undefined, ensoleillement: val.ensoleillement ?? undefined,
          moisSemisDebut: val.moisSemisDebut ?? undefined, moisSemisFin: val.moisSemisFin ?? undefined,
          joursArrosage: val.joursArrosage ?? undefined, joursMaturation: val.joursMaturation ?? undefined,
          typePlanteId: val.typePlanteId!,
        });
        this.plantes.update(liste => liste.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await this.planteService.create({
          nom: val.nom!,
          nomLatin: val.nomLatin ?? undefined, description: val.description ?? undefined,
          conseil: val.conseil ?? undefined, maladies: val.maladies ?? undefined,
          ensoleillement: val.ensoleillement ?? undefined,
          moisSemisDebut: val.moisSemisDebut ?? 1, moisSemisFin: val.moisSemisFin ?? 12,
          joursArrosage: val.joursArrosage ?? 3, joursMaturation: val.joursMaturation ?? 60,
          typePlanteId: val.typePlanteId!,
        });
        this.plantes.update(liste => [...liste, created]);
      }
      this.fermerModal();
    } catch (err) {
      console.error('[plantes:sauvegarder]', err);
    }
  }

  async supprimer(id: number) {
    try {
      await this.planteService.delete(id);
      this.plantes.update(liste => liste.filter(p => p.id !== id));
    } catch (err) {
      console.error('[plantes:supprimer]', err);
    }
  }

  private resetWiki() {
    this.wikiRecherche.set('');
    this.wikiResultat.set(null);
    this.wikiErreur.set(null);
  }
}

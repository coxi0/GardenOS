import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { JardinService, ParcelleFull, CultureFull, Recolte, StatutCulture, TypeSol, Tag } from '../../services/jardin.service';
import { PlanteService } from '../../services/plante.service';
import type { Plante } from '../../services/plante.service';

@Component({
  selector: 'app-jardin',
  templateUrl: './jardin.component.html',
  styleUrl: './jardin.component.css',
})
export class JardinComponent implements OnInit {

  private jardinService = inject(JardinService);
  private planteService = inject(PlanteService);

  // ── Données ──────────────────────────────────────────────────────────────────
  parcelles = signal<ParcelleFull[]>([]);
  statuts   = signal<StatutCulture[]>([]);
  typesSol  = signal<TypeSol[]>([]);
  plantes   = signal<Plante[]>([]);
  tags      = signal<Tag[]>([]);

  async ngOnInit() {
    const [parcelles, statuts, typesSol, plantes, tags] = await Promise.all([
      this.jardinService.getParcelles(),
      this.jardinService.getStatuts(),
      this.jardinService.getTypesSol(),
      this.planteService.getAll(),
      this.jardinService.getTags(),
    ]);
    this.parcelles.set(parcelles);
    this.statuts.set(statuts);
    this.typesSol.set(typesSol);
    this.plantes.set(plantes);
    this.tags.set(tags);
  }

  // ── Modal Parcelle ────────────────────────────────────────────────────────────
  modalParcelleOuvert = signal(false);
  modeEditionParcelle = signal(false);
  formParcelle = signal<Partial<ParcelleFull>>({});

  ouvrirAjoutParcelle() {
    this.formParcelle.set({});
    this.modeEditionParcelle.set(false);
    this.modalParcelleOuvert.set(true);
  }

  ouvrirEditionParcelle(p: ParcelleFull) {
    this.formParcelle.set({ ...p });
    this.modeEditionParcelle.set(true);
    this.modalParcelleOuvert.set(true);
  }

  fermerModalParcelle() {
    this.modalParcelleOuvert.set(false);
  }

  async sauvegarderParcelle() {
    const form = this.formParcelle();
    if (!form.nom) return;

    if (this.modeEditionParcelle()) {
      const updated = await this.jardinService.updateParcelle({
        id: form.id!, nom: form.nom,
        superficie: form.superficie, exposition: form.exposition,
        notes: form.notes, typeSolId: form.typeSolId,
      });
      this.parcelles.update(list => list.map(p => p.id === updated.id ? updated : p));
    } else {
      const created = await this.jardinService.createParcelle({
        nom: form.nom, superficie: form.superficie,
        exposition: form.exposition, notes: form.notes, typeSolId: form.typeSolId,
      });
      this.parcelles.update(list => [...list, created]);
    }
    this.fermerModalParcelle();
  }

  async supprimerParcelle(id: number) {
    await this.jardinService.deleteParcelle(id);
    this.parcelles.update(list => list.filter(p => p.id !== id));
  }

  // ── Modal Culture ─────────────────────────────────────────────────────────────
  modalCultureOuvert  = signal(false);
  modeEditionCulture  = signal(false);
  formCulture         = signal<Partial<CultureFull & { tagsLibelles: string[] }>>({});
  parcelleSelectionnee = signal<number | null>(null);
  tagSaisie           = signal('');

  ouvrirAjoutCulture(parcelleId: number) {
    this.formCulture.set({
      dateSemisPrevue:   new Date().toISOString().slice(0, 10),
      dateRecoltePrevue: new Date().toISOString().slice(0, 10),
      statutId:          this.statuts()[0]?.id,
      planteId:          this.plantes()[0]?.id,
      tagsLibelles:      [],
    });
    this.parcelleSelectionnee.set(parcelleId);
    this.modeEditionCulture.set(false);
    this.modalCultureOuvert.set(true);
  }

  ouvrirEditionCulture(culture: CultureFull) {
    this.formCulture.set({
      ...culture,
      tagsLibelles: culture.tags.map(t => t.libelle),
    });
    this.parcelleSelectionnee.set(culture.parcelleId);
    this.modeEditionCulture.set(true);
    this.modalCultureOuvert.set(true);
  }

  fermerModalCulture() {
    this.modalCultureOuvert.set(false);
    this.tagSaisie.set('');
  }

  ajouterTag() {
    const libelle = this.tagSaisie().trim();
    if (!libelle) return;
    const courants = this.formCulture().tagsLibelles ?? [];
    if (!courants.includes(libelle)) {
      this.formCulture.update(f => ({ ...f, tagsLibelles: [...courants, libelle] }));
    }
    this.tagSaisie.set('');
  }

  retirerTag(libelle: string) {
    this.formCulture.update(f => ({
      ...f,
      tagsLibelles: (f.tagsLibelles ?? []).filter(t => t !== libelle),
    }));
  }

  async sauvegarderCulture() {
    const form = this.formCulture();
    const parcelleId = this.parcelleSelectionnee();
    if (!form.planteId || !form.statutId || !parcelleId) return;

    if (this.modeEditionCulture()) {
      const updated = await this.jardinService.updateCulture({
        id:                form.id!,
        dateSemisPrevue:   form.dateSemisPrevue,
        dateRecoltePrevue: form.dateRecoltePrevue,
        dateSemisReelle:   form.dateSemisReelle,
        dateRecolteReelle: form.dateRecolteReelle,
        notes:             form.notes,
        planteId:          form.planteId,
        statutId:          form.statutId,
        tags:              form.tagsLibelles ?? [],
      });
      this.parcelles.update(list => list.map(p => ({
        ...p,
        cultures: p.cultures.map(c => c.id === updated.id ? updated : c),
      })));
    } else {
      const created = await this.jardinService.createCulture({
        dateSemisPrevue:   form.dateSemisPrevue!,
        dateRecoltePrevue: form.dateRecoltePrevue!,
        dateSemisReelle:   form.dateSemisReelle,
        dateRecolteReelle: form.dateRecolteReelle,
        notes:             form.notes,
        planteId:          form.planteId,
        parcelleId:        parcelleId,
        statutId:          form.statutId,
        tags:              form.tagsLibelles ?? [],
      });
      this.parcelles.update(list => list.map(p =>
        p.id === parcelleId ? { ...p, cultures: [...p.cultures, created] } : p
      ));
    }
    this.fermerModalCulture();
  }

  async supprimerCulture(culture: CultureFull) {
    await this.jardinService.deleteCulture(culture.id);
    this.parcelles.update(list => list.map(p => ({
      ...p,
      cultures: p.cultures.filter(c => c.id !== culture.id),
    })));
  }

  async changerStatut(culture: CultureFull, statutId: number) {
    const updated = await this.jardinService.updateCulture({ id: culture.id, statutId });
    this.parcelles.update(list => list.map(p => ({
      ...p,
      cultures: p.cultures.map(c => c.id === updated.id ? updated : c),
    })));
  }

  // ── Modal Récolte ─────────────────────────────────────────────────────────────
  modalRecolteOuvert   = signal(false);
  cultureSelectionnee  = signal<CultureFull | null>(null);
  formRecolte          = signal<{ quantite: number; unite: string; notes: string }>({
    quantite: 0, unite: 'kg', notes: '',
  });

  ouvrirRecolte(culture: CultureFull) {
    this.cultureSelectionnee.set(culture);
    this.formRecolte.set({ quantite: 0, unite: 'kg', notes: '' });
    this.modalRecolteOuvert.set(true);
  }

  fermerModalRecolte() {
    this.modalRecolteOuvert.set(false);
  }

  async sauvegarderRecolte() {
    const culture = this.cultureSelectionnee();
    const form    = this.formRecolte();
    if (!culture || form.quantite <= 0) return;

    const recolte = await this.jardinService.createRecolte({
      cultureId: culture.id,
      quantite:  form.quantite,
      unite:     form.unite,
      notes:     form.notes || null,
    });

    this.parcelles.update(list => list.map(p => ({
      ...p,
      cultures: p.cultures.map(c =>
        c.id === culture.id ? { ...c, recoltes: [...c.recoltes, recolte] } : c
      ),
    })));
    this.fermerModalRecolte();
  }

  async supprimerRecolte(culture: CultureFull, recolteId: number) {
    await this.jardinService.deleteRecolte(recolteId);
    this.parcelles.update(list => list.map(p => ({
      ...p,
      cultures: p.cultures.map(c =>
        c.id === culture.id
          ? { ...c, recoltes: c.recoltes.filter(r => r.id !== recolteId) }
          : c
      ),
    })));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  couleurStatut(libelle: string): string {
    switch (libelle) {
      case 'Planifiée':  return 'statut-planifiee';
      case 'En cours':   return 'statut-en-cours';
      case 'Récoltée':   return 'statut-recoltee';
      case 'Abandonnée': return 'statut-abandonnee';
      default:           return '';
    }
  }

  totalRecoltes(culture: CultureFull): string {
    if (!culture.recoltes.length) return '';
    const total = culture.recoltes.reduce((s, r) => s + r.quantite, 0);
    return `${total} ${culture.recoltes[0].unite}`;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}

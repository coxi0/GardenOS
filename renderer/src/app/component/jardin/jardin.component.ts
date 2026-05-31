import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { JardinService, ParcelleFull, CultureFull, Recolte, StatutCulture, TypeSol, Tag } from '../../services/jardin.service';
import { PlanteService } from '../../services/plante.service';
import type { Plante } from '../../services/plante.service';

interface GridCell {
  x: number;
  y: number;
  parcelle: ParcelleFull | null;
}

@Component({
  standalone: true,
  selector: 'app-jardin',
  templateUrl: './jardin.component.html',
  styleUrl: './jardin.component.css',
})
export class JardinComponent implements OnInit {

  private jardinService = inject(JardinService);
  private planteService = inject(PlanteService);

  parcelles = signal<ParcelleFull[]>([]);
  statuts   = signal<StatutCulture[]>([]);
  typesSol  = signal<TypeSol[]>([]);
  plantes   = signal<Plante[]>([]);
  tags      = signal<Tag[]>([]);

  async ngOnInit() {
    try {
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
    } catch (err) {
      console.error('[jardin:ngOnInit]', err);
    }
  }

  readonly COLS = 4;
  readonly ROWS = 4;

  grille = computed<GridCell[]>(() => {
    const cells: GridCell[] = [];
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        const parcelle = this.parcelles().find(p => p.posX === x && p.posY === y) ?? null;
        cells.push({ x, y, parcelle });
      }
    }
    return cells;
  });

  draggedId = signal<number | null>(null);

  onDragStart(parcelle: ParcelleFull) {
    this.draggedId.set(parcelle.id);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  async onDrop(event: DragEvent, cell: GridCell) {
    event.preventDefault();
    const id = this.draggedId();
    if (id === null) return;
    if (cell.parcelle && cell.parcelle.id !== id) return;
    try {
      const updated = await this.jardinService.updateParcelle({ id, posX: cell.x, posY: cell.y });
      this.parcelles.update(list => list.map(p => p.id === updated.id ? updated : p));
      this.draggedId.set(null);
    } catch (err) {
      console.error('[jardin:onDrop]', err);
    }
  }

  onDragEnd() {
    this.draggedId.set(null);
  }

  modalParcelleOuvert = signal(false);
  modeEditionParcelle = signal(false);
  formParcelle        = signal<Partial<ParcelleFull>>({});
  celleCible          = signal<{ x: number; y: number } | null>(null);

  ouvrirAjoutParcelle(cell: GridCell) {
    this.formParcelle.set({ posX: cell.x, posY: cell.y });
    this.celleCible.set({ x: cell.x, y: cell.y });
    this.modeEditionParcelle.set(false);
    this.modalParcelleOuvert.set(true);
  }

  ouvrirEditionParcelle(p: ParcelleFull, event: MouseEvent) {
    event.stopPropagation();
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
    try {
      if (this.modeEditionParcelle()) {
        const updated = await this.jardinService.updateParcelle({
          id: form.id!, nom: form.nom,
          superficie: form.superficie, exposition: form.exposition,
          notes: form.notes, typeSolId: form.typeSolId,
          posX: form.posX, posY: form.posY,
        });
        this.parcelles.update(list => list.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await this.jardinService.createParcelle({
          nom: form.nom, superficie: form.superficie,
          exposition: form.exposition, notes: form.notes,
          typeSolId: form.typeSolId,
          posX: form.posX ?? 0, posY: form.posY ?? 0,
        });
        this.parcelles.update(list => [...list, created]);
      }
      this.fermerModalParcelle();
    } catch (err) {
      console.error('[jardin:sauvegarderParcelle]', err);
    }
  }

  async supprimerParcelle(id: number, event: MouseEvent) {
    event.stopPropagation();
    try {
      await this.jardinService.deleteParcelle(id);
      this.parcelles.update(list => list.filter(p => p.id !== id));
    } catch (err) {
      console.error('[jardin:supprimerParcelle]', err);
    }
  }

  parcelleDetail = signal<ParcelleFull | null>(null);

  ouvrirDetail(parcelle: ParcelleFull) {
    this.parcelleDetail.set(parcelle);
  }

  fermerDetail() {
    this.parcelleDetail.set(null);
  }

  modalCultureOuvert   = signal(false);
  modeEditionCulture   = signal(false);
  formCulture          = signal<Partial<CultureFull & { tagsLibelles: string[] }>>({});
  parcelleSelectionnee = signal<number | null>(null);
  tagSaisie            = signal('');

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
    this.formCulture.set({ ...culture, tagsLibelles: culture.tags.map(t => t.libelle) });
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
    if (!courants.includes(libelle))
      this.formCulture.update(f => ({ ...f, tagsLibelles: [...courants, libelle] }));
    this.tagSaisie.set('');
  }

  retirerTag(libelle: string) {
    this.formCulture.update(f => ({
      ...f, tagsLibelles: (f.tagsLibelles ?? []).filter(t => t !== libelle),
    }));
  }

  async sauvegarderCulture() {
    const form       = this.formCulture();
    const parcelleId = this.parcelleSelectionnee();
    if (!form.planteId || !form.statutId || !parcelleId) return;
    try {
      if (this.modeEditionCulture()) {
        const updated = await this.jardinService.updateCulture({
          id: form.id!, dateSemisPrevue: form.dateSemisPrevue,
          dateRecoltePrevue: form.dateRecoltePrevue,
          dateSemisReelle: form.dateSemisReelle, dateRecolteReelle: form.dateRecolteReelle,
          notes: form.notes, planteId: form.planteId, statutId: form.statutId,
          tags: form.tagsLibelles ?? [],
        });
        this.parcelles.update(list => list.map(p => ({
          ...p, cultures: p.cultures.map(c => c.id === updated.id ? updated : c),
        })));
        this.parcelleDetail.update(d => d ? {
          ...d, cultures: d.cultures.map(c => c.id === updated.id ? updated : c),
        } : d);
      } else {
        const created = await this.jardinService.createCulture({
          dateSemisPrevue: form.dateSemisPrevue!, dateRecoltePrevue: form.dateRecoltePrevue!,
          dateSemisReelle: form.dateSemisReelle, dateRecolteReelle: form.dateRecolteReelle,
          notes: form.notes, planteId: form.planteId, parcelleId,
          statutId: form.statutId, tags: form.tagsLibelles ?? [],
        });
        this.parcelles.update(list => list.map(p =>
          p.id === parcelleId ? { ...p, cultures: [...p.cultures, created] } : p
        ));
        this.parcelleDetail.update(d =>
          d?.id === parcelleId ? { ...d, cultures: [...d.cultures, created] } : d
        );
      }
      this.fermerModalCulture();
    } catch (err) {
      console.error('[jardin:sauvegarderCulture]', err);
    }
  }

  async supprimerCulture(culture: CultureFull) {
    try {
      await this.jardinService.deleteCulture(culture.id);
      this.parcelles.update(list => list.map(p => ({
        ...p, cultures: p.cultures.filter(c => c.id !== culture.id),
      })));
      this.parcelleDetail.update(d => d ? {
        ...d, cultures: d.cultures.filter(c => c.id !== culture.id),
      } : d);
    } catch (err) {
      console.error('[jardin:supprimerCulture]', err);
    }
  }

  async changerStatut(culture: CultureFull, statutId: number) {
    try {
      const updated = await this.jardinService.updateCulture({ id: culture.id, statutId });
      this.parcelles.update(list => list.map(p => ({
        ...p, cultures: p.cultures.map(c => c.id === updated.id ? updated : c),
      })));
      this.parcelleDetail.update(d => d ? {
        ...d, cultures: d.cultures.map(c => c.id === updated.id ? updated : c),
      } : d);
    } catch (err) {
      console.error('[jardin:changerStatut]', err);
    }
  }

  modalRecolteOuvert  = signal(false);
  cultureSelectionnee = signal<CultureFull | null>(null);
  formRecolte         = signal({ quantite: 0, unite: 'kg', notes: '' });

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
    try {
      const recolte = await this.jardinService.createRecolte({
        cultureId: culture.id, quantite: form.quantite,
        unite: form.unite, notes: form.notes || null,
      });
      const update = (list: ParcelleFull[]) => list.map(p => ({
        ...p, cultures: p.cultures.map(c =>
          c.id === culture.id ? { ...c, recoltes: [...c.recoltes, recolte] } : c
        ),
      }));
      this.parcelles.update(update);
      this.parcelleDetail.update(d => d ? update([d])[0] : d);
      this.fermerModalRecolte();
    } catch (err) {
      console.error('[jardin:sauvegarderRecolte]', err);
    }
  }

  async supprimerRecolte(culture: CultureFull, recolteId: number) {
    try {
      await this.jardinService.deleteRecolte(recolteId);
      const update = (list: ParcelleFull[]) => list.map(p => ({
        ...p, cultures: p.cultures.map(c =>
          c.id === culture.id
            ? { ...c, recoltes: c.recoltes.filter(r => r.id !== recolteId) }
            : c
        ),
      }));
      this.parcelles.update(update);
      this.parcelleDetail.update(d => d ? update([d])[0] : d);
    } catch (err) {
      console.error('[jardin:supprimerRecolte]', err);
    }
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

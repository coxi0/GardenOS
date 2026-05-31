import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { JardinService, ParcelleFull, CultureFull, Recolte, StatutCulture, TypeSol, Tag } from '../../services/jardin.service';
import { PlanteService } from '../../services/plante.service';
import type { Plante } from '../../services/plante.service';

/** Cellule de la grille du jardin (coordonnées x/y + parcelle éventuelle à cet emplacement). */
interface GridCell {
  x: number;
  y: number;
  parcelle: ParcelleFull | null;
}

/**
 * Composant principal de la vue Jardin.
 * Affiche une grille 4×4 de parcelles avec drag & drop pour les repositionner.
 * Gère les modales de création/édition des parcelles, cultures et récoltes.
 */
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

  /** Charge en parallèle toutes les données nécessaires à l'affichage du jardin. */
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

  /** Grille calculée : toutes les cellules (x, y) avec la parcelle qui les occupe, ou null. */
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

  /** Identifiant de la parcelle en cours de déplacement (drag & drop). */
  draggedId = signal<number | null>(null);

  /** Mémorise la parcelle glissée au début du drag. */
  onDragStart(parcelle: ParcelleFull) {
    this.draggedId.set(parcelle.id);
  }

  /** Autorise le drop sur la cellule cible. */
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  /** Dépose la parcelle glissée sur la cellule cible et persiste la nouvelle position. */
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

  /** Réinitialise l'état de drag si le drop est annulé. */
  onDragEnd() {
    this.draggedId.set(null);
  }

  // ── Modale Parcelle ─────────────────────────────────────────────────────────

  modalParcelleOuvert = signal(false);
  modeEditionParcelle = signal(false);
  formParcelle        = signal<Partial<ParcelleFull>>({});
  celleCible          = signal<{ x: number; y: number } | null>(null);

  /** Ouvre la modale pour créer une nouvelle parcelle à la position de la cellule cliquée. */
  ouvrirAjoutParcelle(cell: GridCell) {
    this.formParcelle.set({ posX: cell.x, posY: cell.y });
    this.celleCible.set({ x: cell.x, y: cell.y });
    this.modeEditionParcelle.set(false);
    this.modalParcelleOuvert.set(true);
  }

  /** Ouvre la modale pour éditer une parcelle existante. */
  ouvrirEditionParcelle(p: ParcelleFull, event: MouseEvent) {
    event.stopPropagation();
    this.formParcelle.set({ ...p });
    this.modeEditionParcelle.set(true);
    this.modalParcelleOuvert.set(true);
  }

  /** Ferme la modale parcelle. */
  fermerModalParcelle() {
    this.modalParcelleOuvert.set(false);
  }

  /** Crée ou met à jour une parcelle selon le mode du formulaire. */
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

  /** Supprime une parcelle et met à jour la grille localement. */
  async supprimerParcelle(id: number, event: MouseEvent) {
    event.stopPropagation();
    try {
      await this.jardinService.deleteParcelle(id);
      this.parcelles.update(list => list.filter(p => p.id !== id));
    } catch (err) {
      console.error('[jardin:supprimerParcelle]', err);
    }
  }

  // ── Panneau de détail ────────────────────────────────────────────────────────

  /** Parcelle dont le détail est affiché dans le panneau latéral, ou null. */
  parcelleDetail = signal<ParcelleFull | null>(null);

  /** Affiche le panneau de détail pour la parcelle donnée. */
  ouvrirDetail(parcelle: ParcelleFull) {
    this.parcelleDetail.set(parcelle);
  }

  /** Ferme le panneau de détail. */
  fermerDetail() {
    this.parcelleDetail.set(null);
  }

  // ── Modale Culture ───────────────────────────────────────────────────────────

  modalCultureOuvert   = signal(false);
  modeEditionCulture   = signal(false);
  formCulture          = signal<Partial<CultureFull & { tagsLibelles: string[] }>>({});
  parcelleSelectionnee = signal<number | null>(null);
  tagSaisie            = signal('');

  /** Ouvre la modale pour créer une culture dans la parcelle donnée. */
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

  /** Ouvre la modale pour éditer une culture existante. */
  ouvrirEditionCulture(culture: CultureFull) {
    this.formCulture.set({ ...culture, tagsLibelles: culture.tags.map(t => t.libelle) });
    this.parcelleSelectionnee.set(culture.parcelleId);
    this.modeEditionCulture.set(true);
    this.modalCultureOuvert.set(true);
  }

  /** Ferme la modale culture et remet le champ de saisie de tag à vide. */
  fermerModalCulture() {
    this.modalCultureOuvert.set(false);
    this.tagSaisie.set('');
  }

  /** Ajoute le tag saisi à la liste des tags du formulaire de culture. */
  ajouterTag() {
    const libelle = this.tagSaisie().trim();
    if (!libelle) return;
    const courants = this.formCulture().tagsLibelles ?? [];
    if (!courants.includes(libelle))
      this.formCulture.update(f => ({ ...f, tagsLibelles: [...courants, libelle] }));
    this.tagSaisie.set('');
  }

  /** Retire un tag de la liste des tags du formulaire de culture. */
  retirerTag(libelle: string) {
    this.formCulture.update(f => ({
      ...f, tagsLibelles: (f.tagsLibelles ?? []).filter(t => t !== libelle),
    }));
  }

  /** Crée ou met à jour une culture et synchronise les signaux parcelles et parcelleDetail. */
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

  /** Supprime une culture et la retire de tous les signaux locaux. */
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

  /** Change le statut d'une culture sans ouvrir la modale. */
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

  // ── Modale Récolte ───────────────────────────────────────────────────────────

  modalRecolteOuvert  = signal(false);
  cultureSelectionnee = signal<CultureFull | null>(null);
  formRecolte         = signal({ quantite: 0, unite: 'kg', notes: '' });

  /** Ouvre la modale de saisie d'une récolte pour la culture donnée. */
  ouvrirRecolte(culture: CultureFull) {
    this.cultureSelectionnee.set(culture);
    this.formRecolte.set({ quantite: 0, unite: 'kg', notes: '' });
    this.modalRecolteOuvert.set(true);
  }

  /** Ferme la modale de récolte. */
  fermerModalRecolte() {
    this.modalRecolteOuvert.set(false);
  }

  /** Enregistre la récolte et met à jour les signaux locaux. */
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

  /** Supprime une récolte et met à jour les signaux locaux. */
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

  // ── Utilitaires ──────────────────────────────────────────────────────────────

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

  /** Retourne le total des récoltes d'une culture sous forme de chaîne lisible. */
  totalRecoltes(culture: CultureFull): string {
    if (!culture.recoltes.length) return '';
    const total = culture.recoltes.reduce((s, r) => s + r.quantite, 0);
    return `${total} ${culture.recoltes[0].unite}`;
  }

  /** Formate une date ISO en date française courte, ou retourne "—" si null. */
  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}

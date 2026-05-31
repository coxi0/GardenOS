import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JournalService, JournalEntry } from '../../services/journal.service';
import { JardinService, ParcelleFull } from '../../services/jardin.service';

interface CultureOption {
  id: number;
  label: string;
}

@Component({
  standalone: true,
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrl: './journal.component.css',
  imports: [FormsModule],
})
export class JournalComponent implements OnInit {

  private journalService = inject(JournalService);
  private jardinService  = inject(JardinService);

  entrees   = signal<JournalEntry[]>([]);
  parcelles = signal<ParcelleFull[]>([]);

  async ngOnInit() {
    try {
      const [entrees, parcelles] = await Promise.all([
        this.journalService.getAll(),
        this.jardinService.getParcelles(),
      ]);
      this.entrees.set(entrees);
      this.parcelles.set(parcelles);
    } catch (err) {
      console.error('[journal:ngOnInit]', err);
    }
  }

  cultures = computed<CultureOption[]>(() =>
    this.parcelles().flatMap(p =>
      p.cultures.map(c => ({
        id:    c.id,
        label: `${c.plante.nom} — ${p.nom}`,
      }))
    )
  );

  recherche       = signal('');
  filtreCultureId = signal<number | null>(null);

  constructor() {
    effect(() => {
      this.filtreCultureId();
      this.recherche.set('');
    });
  }

  entreesFiltrees = computed(() => {
    const terme     = this.recherche().toLowerCase();
    const cultureId = this.filtreCultureId();
    return this.entrees().filter(e => {
      const matchTexte   = !terme     || e.contenu.toLowerCase().includes(terme);
      const matchCulture = !cultureId || e.cultureId === cultureId;
      return matchTexte && matchCulture;
    });
  });

  modalOuvert   = signal(false);
  modeEdition   = signal(false);
  editId        = signal<number | null>(null);

  formContenu   = signal('');
  formCultureId = signal<number | null>(null);
  formDate      = signal<string>(new Date().toISOString().slice(0, 10));

  ouvrirAjout() {
    this.editId.set(null);
    this.formContenu.set('');
    this.formCultureId.set(this.cultures()[0]?.id ?? null);
    this.formDate.set(new Date().toISOString().slice(0, 10));
    this.modeEdition.set(false);
    this.modalOuvert.set(true);
  }

  ouvrirEdition(entree: JournalEntry) {
    this.editId.set(entree.id);
    this.formContenu.set(entree.contenu);
    this.formCultureId.set(entree.cultureId);
    this.formDate.set(new Date(entree.date).toISOString().slice(0, 10));
    this.modeEdition.set(true);
    this.modalOuvert.set(true);
  }

  fermerModal() {
    this.modalOuvert.set(false);
  }

  async sauvegarder() {
    const contenu   = this.formContenu().trim();
    const cultureId = this.formCultureId();
    if (!contenu || !cultureId) return;
    try {
      if (this.modeEdition()) {
        const updated = await this.journalService.update({
          id:      this.editId()!,
          contenu,
          date:    this.formDate(),
        });
        this.entrees.update(liste => liste.map(e => e.id === updated.id ? updated : e));
      } else {
        const created = await this.journalService.create({
          contenu,
          cultureId,
          date: this.formDate(),
        });
        this.entrees.update(liste => [created, ...liste]);
      }
      this.fermerModal();
    } catch (err) {
      console.error('[journal:sauvegarder]', err);
    }
  }

  async supprimer(id: number) {
    try {
      await this.journalService.delete(id);
      this.entrees.update(liste => liste.filter(e => e.id !== id));
    } catch (err) {
      console.error('[journal:supprimer]', err);
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}

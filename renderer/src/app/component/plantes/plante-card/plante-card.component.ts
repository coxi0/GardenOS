import { Component, input, output } from '@angular/core';
import { Plante } from '../../../services/plante.service';

/**
 * Composant de présentation (dumb component) pour une carte de plante.
 * Reçoit la plante via @input et remonte les actions via @output
 * sans contenir de logique métier.
 */
@Component({
  standalone: true,
  selector: 'app-plante-card',
  templateUrl: './plante-card.component.html',
  styleUrl: './plante-card.component.css',
})
export class PlanteCardComponent {
  /** Plante à afficher (obligatoire). */
  plante    = input.required<Plante>();
  /** Émet la plante lorsque l'utilisateur demande une édition. */
  editer    = output<Plante>();
  /** Émet l'identifiant lorsque l'utilisateur demande une suppression. */
  supprimer = output<number>();
}

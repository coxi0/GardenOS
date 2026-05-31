import { Component, input, output } from '@angular/core';
import { Plante } from '../../../services/plante.service';

@Component({
  standalone: true,
  selector: 'app-plante-card',
  templateUrl: './plante-card.component.html',
  styleUrl: './plante-card.component.css',
})
export class PlanteCardComponent {
  plante  = input.required<Plante>();
  editer    = output<Plante>();
  supprimer = output<number>();
}

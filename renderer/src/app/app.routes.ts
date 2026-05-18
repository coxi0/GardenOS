import { Routes } from '@angular/router';
import { PlantesComponent } from './component/plantes/plantes.component';

export const routes: Routes = [
    { path: '', redirectTo: 'plantes', pathMatch: 'full' }, // "/" redirige vers "/plantes"
    { path: 'plantes', component: PlantesComponent },       // "/plantes" affiche ce composant
    //{ path: '**', component: NotFoundComponent }
];

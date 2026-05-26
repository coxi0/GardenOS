import { Routes } from '@angular/router';
import { PlantesComponent } from './component/plantes/plantes.component';
import { StockComponent } from './component/stock/stock.component';
import { JardinComponent } from './component/jardin/jardin.component';

export const routes: Routes = [
    { path: '', redirectTo: 'plantes', pathMatch: 'full' },
    { path: 'plantes', component: PlantesComponent },
    { path: 'stock',   component: StockComponent   },
    { path: 'jardin',  component: JardinComponent  },
];

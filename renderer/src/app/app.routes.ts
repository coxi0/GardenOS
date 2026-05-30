import { Routes } from '@angular/router';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { PlantesComponent } from './component/plantes/plantes.component';
import { StockComponent } from './component/stock/stock.component';
import { JardinComponent } from './component/jardin/jardin.component';
import { ParametresComponent } from './component/parametres/parametres.component';

export const routes: Routes = [
    { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard',  component: DashboardComponent  },
    { path: 'jardin',     component: JardinComponent     },
    { path: 'plantes',    component: PlantesComponent    },
    { path: 'stock',      component: StockComponent      },
    { path: 'parametres', component: ParametresComponent },
];

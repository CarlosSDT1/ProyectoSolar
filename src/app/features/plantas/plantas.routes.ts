import { Routes } from '@angular/router';
import { userGuard } from '../../core/guards/user-guard-guard';
import PrincipalPlacas from '../main/pages/principal-placas/principal-placas';
import { PlantesDetall } from './pages/plantes-detall/plantes-detall';

export const PLANTAS_ROUTES: Routes = [
  {
    path: '',
    component: PrincipalPlacas,
    canActivate: [userGuard],
  },
  {
    path: ':id',
    component: PlantesDetall,
  },
];

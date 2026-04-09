import { Routes } from '@angular/router';
import { userGuard } from '../../core/guards/user-guard-guard';
import AdminTabla from './pages/admin-tabla/admin-tabla';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminTabla,
    canActivate: [userGuard],
  },
];

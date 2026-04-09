import { Routes } from '@angular/router';
import { userGuard } from './core/guards/user-guard-guard';
import AdminTabla from './features/admin/pages/admin-tabla/admin-tabla';
import { LoginPage } from './features/auth/pages/login-page/login-page';
import { RegisterPage } from './features/auth/pages/register-page/register-page';
import HomePage from './features/main/pages/home-page/home-page';
import PrincipalPlacas from './features/main/pages/principal-placas/principal-placas';
import { PlantesDetall } from './features/plantas/pages/plantes-detall/plantes-detall';
import ProfilePage from './features/profile/pages/profile-page/profile-page';


export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./features/main/main.routes').then((m) => m.MAIN_ROUTES),
  },
  {
    path: 'plantas',
    loadChildren: () =>
      import('./features/plantas/plantas.routes').then((m) => m.PLANTAS_ROUTES),
  },
  {
    path: 'tabla',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'planta',
    loadChildren: () =>
      import('./features/plantas/plantas.routes').then((m) => m.PLANTAS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

import { Routes } from '@angular/router';
import HomePage from './shared/pages/home-page/home-page';
import PrincipalPlacas from './shared/pages/principal-placas/principal-placas';
import { PlantesDetall } from './pages/plantes-detall/plantes-detall';
import PlantasList from './components/plantas-list/plantas-list';
import { LoginPage } from './pages/auth/login-page/login-page';
import { RegisterPage } from './pages/auth/register-page/register-page';
import { userGuard } from './guards/user-guard-guard';
import AdminTabla from './components/admin-tabla/admin-tabla';


export const routes: Routes = [


  {
    path:'home',
    component:HomePage
  },
  {
    path:'plantas',
    component:PrincipalPlacas,
    canActivate:[userGuard],
  },
  {
    path:'tabla',
    component:AdminTabla,
  },
  {
    path:'login',
    component:LoginPage
  },
  {
    path:'register',
    component:RegisterPage
  },
  {
    path:'planta/:id',
    component:PlantesDetall,
  },
  {
    path:'**',
    redirectTo:'home', pathMatch: 'full'
  }
];

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
    path:'home',
    component:HomePage
  },
  {
    path:'plantas',
    component:PrincipalPlacas,
    //canActivate:[userGuard],
  },
  {
    path:'tabla',
    component:AdminTabla,
    //canActivate:[userGuard],
  },
  {
    path: 'profile',
    component: ProfilePage,
    //canActivate: [userGuard],
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

import { Routes } from '@angular/router';
import { userGuard } from '../../core/guards/user-guard-guard';
import ProfilePage from './pages/profile-page/profile-page';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    component: ProfilePage,
    canActivate: [userGuard],
  },
];

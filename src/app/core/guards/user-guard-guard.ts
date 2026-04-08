import { inject } from '@angular/core';
import { Router, UrlTree, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../features/auth/services/authservice';


export const userGuard: CanActivateFn = async (route, state) => {
  const router: Router = inject(Router);
  const authSupabaseService: AuthService = inject(AuthService);

  const session = await authSupabaseService.getCurrentSession();

  return session ? true : router.parseUrl('/home');
};

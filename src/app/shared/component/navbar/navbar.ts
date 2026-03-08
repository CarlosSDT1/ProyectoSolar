import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Session } from '@supabase/supabase-js';
import { AuthService } from '../../../services/authservice';
import { FormsModule } from '@angular/forms';
import { Supaservice } from '../../../services/supaservice';

type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
  website: string | null;
  role: string;
};

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
})
export class Navbar {
  private supaService = inject(Supaservice);
  private authService = inject(AuthService);
  private router: Router = inject(Router);

  session = signal<Session | null>(null);
  profile = signal<UserProfile | null>(null);

  searchString = '';

  search($event: string) {
    this.supaService.setSearchString($event);
  }

  constructor() {
    this.authService.authChangesObservable().subscribe(async ({ session }) => {
      this.session.set(session);

      if (session?.user?.id) {
        await this.loadProfile(session.user.id);
      } else {
        this.profile.set(null);
      }
    });

    const currentSession = this.authService.loggedSubject.getValue();
    if (currentSession?.user?.id) {
      this.session.set(currentSession);
      this.loadProfile(currentSession.user.id);
    }
  }

  async loadProfile(userId: string) {
    try {
      const profile = await this.supaService.getProfileById(userId);
      this.profile.set(profile);
    } catch (error) {
      console.error('Error cargando perfil en navbar:', error);
      this.profile.set(null);
    }
  }

  getDisplayName(): string {
    const username = this.profile()?.username?.trim();
    return username || this.session()?.user?.email || '';
  }

  logout() {
    this.authService.logout()
      .then(() => {
        console.log('Logout exitoso');
        this.profile.set(null);
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error en logout:', error);
        this.router.navigate(['/login']);
      });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}

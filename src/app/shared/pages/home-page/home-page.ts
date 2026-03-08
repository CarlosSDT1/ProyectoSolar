import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { AuthService } from '../../../services/authservice';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
})
export default class HomePage {
  private authService = inject(AuthService);

  session = signal<Session | null>(null);

  constructor() {
    this.authService.authChangesObservable().subscribe(({ session }) => {
      this.session.set(session);
    });
  }

  getStartRoute(): string {
    return this.session() ? '/plantas' : '/login';
  }
}

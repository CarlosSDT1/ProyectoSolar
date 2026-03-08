import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Session } from '@supabase/supabase-js';
import { AuthService } from '../../../services/authservice';
import { FormsModule } from '@angular/forms';
import { Supaservice } from '../../../services/supaservice';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './navbar.html',
})
export class Navbar {

  private supaService = inject(Supaservice);
  private authService = inject(AuthService);
  private router: Router = inject(Router);

  session = signal<Session|null>({} as Session);

  searchString= '';


  search($event: string){
    this.supaService.setSearchString($event);
  }

  constructor(){
    this.authService.authChangesObservable().subscribe(({ event, session }) => {
      console.log('Auth event:', event);
      console.log('Session:', session);
      this.session.set(session);
    });
  }

  logout(){
    this.authService.logout()
      .then(() => {
        console.log('Logout exitoso');

        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.error('Error en logout:', error);
        this.router.navigate(['/login']);
      });
  }
}

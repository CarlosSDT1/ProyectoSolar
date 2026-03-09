import { Injectable } from '@angular/core';
import { AuthChangeEvent, createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
  this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);

  this.authChangesObservable().subscribe(({ session }) => {
    this.loggedSubject.next(session);
  });
}

  async register(email: string, password: string, username: string) {
  const { data, error } = await this.supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('Error en Register:', error);
    throw error;
  }

  if (data.user) {
    const { error: profileError } = await this.supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username
      });

    if (profileError) {
      console.error('Error creando perfil:', profileError);
      throw profileError;
    }
  }

  return data;
}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Error en login:', error);
      throw error;
    }

    console.log('Login exitoso en AuthService:', data);

    await new Promise(resolve => setTimeout(resolve, 100));

    return data;
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  loggedSubject = new BehaviorSubject<Session | null>(null);

  authChangesObservable(): Observable<{ event: AuthChangeEvent, session: Session | null }> {
    return new Observable((subscriber) => {
      const { data: authListener } = this.authChanges(
        (event: AuthChangeEvent, session: Session | null) => {
          console.log('Auth change event:', event, 'Session:', session);
          subscriber.next({ event, session });
        },
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    });
  }

  async loadSession() {
  const { data } = await this.supabase.auth.getSession();
  this.loggedSubject.next(data.session);
}

async getCurrentSession(): Promise<Session | null> {
  const { data, error } = await this.supabase.auth.getSession();

  if (error) {
    console.error('Error obteniendo sesión actual:', error);
    return null;
  }

  this.loggedSubject.next(data.session);
  return data.session;
}
}

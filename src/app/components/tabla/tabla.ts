import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { planta } from '../../interface/planta.interface';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/authservice';
import { Supaservice } from '../../services/supaservice';

type ProfileOption = {
  id: string;
  username: string | null;
};

@Component({
  selector: '[app-tabla]',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './tabla.html',
})
export default class Tabla {
  planta = input.required<planta>();
  profiles = input<ProfileOption[]>([]);

  action = output<{ action: 'editar' | 'eliminar', planta: planta }>();

  private authService = inject(AuthService);
  private supaservice = inject(Supaservice);

  myRole = signal<string>('user');
  myUid = computed(() => this.authService.loggedSubject.getValue()?.user?.id ?? '');

  canEdit = computed(() => {
    const uid = this.myUid();
    const plantaActual = this.planta();
    return this.myRole() === 'admin' || plantaActual.user === uid;
  });

  constructor() {
    this.loadMyRole();
  }

  async loadMyRole() {
    try {
      const uid = this.authService.loggedSubject.getValue()?.user?.id;
      if (!uid) return;

      const profile = await this.supaservice.getMyProfile(uid);
      this.myRole.set(profile?.role ?? 'user');
    } catch (error) {
      console.error('Error cargando rol del usuario:', error);
    }
  }

  getUserDisplayName(): string {
    const profile = this.profiles().find(p => p.id === this.planta().user);
    return profile?.username?.trim() || this.planta().user;
  }

  editar() {
    if (!this.canEdit()) return;
    this.action.emit({ action: 'editar', planta: this.planta() });
  }

  eliminar() {
    if (!this.canEdit()) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta planta?')) {
      this.action.emit({ action: 'eliminar', planta: this.planta() });
    }
  }
}

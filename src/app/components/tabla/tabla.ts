import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { planta } from '../../interface/planta.interface';
import { RouterLink } from '@angular/router';

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

  action = output<{action: 'editar' | 'eliminar', planta: planta}>();

  getUserDisplayName(): string {
    const profile = this.profiles().find(p => p.id === this.planta().user);
    return profile?.username?.trim() || this.planta().user;
  }

  editar() {
    this.action.emit({action: 'editar', planta: this.planta()});
  }

  eliminar() {
    if (confirm('¿Estás seguro de que quieres eliminar esta planta?')) {
      this.action.emit({action: 'eliminar', planta: this.planta()});
    }
  }
}

import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { planta } from '../../interface/planta.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: '[app-tabla]',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './tabla.html',
})
export default class Tabla {
  planta = input.required<planta>();

  action = output<{action: 'editar' | 'eliminar', planta: planta}>();

  editar() {
    this.action.emit({action: 'editar', planta: this.planta()});
  }

  eliminar() {
    if (confirm('¿Estás seguro de que quieres eliminar esta planta?')) {
      this.action.emit({action: 'eliminar', planta: this.planta()});
    }
  }
}

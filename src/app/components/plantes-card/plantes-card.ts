
import { Component, inject, input, output } from '@angular/core';
import { planta } from '../../interface/planta.interface';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-plantes-card',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './plantes-card.html',
})
export class PlantesCard {

  planta = input.required<planta>();
  private supaservice = inject(Supaservice);

  favoriteToggle = output<void>();

  async toggleFavorite() {
    try {
      const plantaActual = this.planta();

      if (plantaActual.favorite) {
        this.supaservice.unMakeFavorite(plantaActual.id);
      } else {
        this.supaservice.makeFavorite(plantaActual.id);
      }

      this.favoriteToggle.emit();

    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  }
}

import { Component, inject, input, output } from '@angular/core';
import { planta } from '../../interface/planta.interface';
import { PlantesCard } from "../plantes-card/plantes-card";
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-plantas-card-list',
  imports: [PlantesCard],
  templateUrl: './plantas-card-list.html',
})
export class PlantasCardList {
  plantas = input.required<planta[]>();
  private supaservice = inject(Supaservice);

  async toggleFavorite(planta: planta) {
    try {
      if (planta.favorite) {
        await this.supaservice.unMakeFavorite(planta.id);
      } else {
        await this.supaservice.makeFavorite(planta.id);
      }
      
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  }
}
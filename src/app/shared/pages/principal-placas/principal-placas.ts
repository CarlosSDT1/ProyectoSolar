import { Component, inject, signal } from '@angular/core';
import PlantasList from '../../../components/plantas-list/plantas-list';
import { planta } from '../../../interface/planta.interface';

import { PlantesCard } from "../../../components/plantes-card/plantes-card";
import { PlantasCardList } from "../../../components/plantas-card-list/plantas-card-list";
import { Supaservice } from '../../../services/supaservice';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';

@Component({
  selector: 'app-principal-placas',
  imports: [ PlantasCardList],
  templateUrl: './principal-placas.html',

})
export default class PrincipalPlacas {
  private Supaservice: Supaservice = inject(Supaservice)
   //plantas = signal<planta[]>([]);
   ngOnInit():void{
      //this.plantas.set(plantasDemo);
      //console.log(this.Supaservice.getEcho("Hola Mon"))
      //this.Supaservice.getPlantes().subscribe(
      //  (plantesSupabase: planta[])=> {
      //    this.plantas.set(plantesSupabase);
      //  }
      //)
    }

  plantas = toSignal(from(this.Supaservice.getPlantasObservable()), {
    initialValue: []
  })
}

import { Component, inject, signal } from '@angular/core';
import PlantasList from '../../../plantas/components/plantas-list/plantas-list';
import { planta } from '../../../../shared/interface/planta.interface';

import { PlantesCard } from "../../../plantas/components/plantes-card/plantes-card";
import { PlantasCardList } from "../../../plantas/components/plantas-card-list/plantas-card-list";

import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { Supaservice } from '../../../../core/services/supaservice';

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

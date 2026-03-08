import { Component, effect, inject, input, signal } from '@angular/core';
import { PlantaInformation } from "./planta-information/planta-information";
import { NotFound } from "../../shared/pages/not-found/not-found";
import { Supaservice } from '../../services/supaservice';;
import { registre } from '../../interface/registre.interface';
import { PaginationService } from '../../shared/component/pagination/pagination.service';

@Component({
  selector: 'app-plantes-detall',
  imports: [PlantaInformation, NotFound],
  templateUrl: './plantes-detall.html',
})
export class PlantesDetall {
  id = input<string>();
  private plantaService = inject(Supaservice);
  private paginationService = inject(PaginationService);

  planta = signal<any>(undefined);
  registres = signal<registre[]>([]);
  totalPages = signal<number>(0);
  totalRegistres = signal<number>(0);

  currentPage = this.paginationService.currentPage;

  constructor() {
    effect(() => {
      this.loadPlantaAndRegistres();
    });
  }

  async loadPlantaAndRegistres(): Promise<void> {
    const idNum = Number(this.id());
    const page = this.currentPage();

    if (idNum > 0) {
      if (!this.planta() || this.planta()?.id !== idNum) {
        const data = await this.plantaService.getPlantaByIDSupabase(idNum);
        this.planta.set(data?.[0]);
      }

      const response = await this.plantaService.getRegistresSupabase(idNum, page, 4);
      this.registres.set(response.data);
      this.totalPages.set(response.pages);
      this.totalRegistres.set(response.total);
    }
  }

  async ngOnChanges(): Promise<void> {
    await this.loadPlantaAndRegistres();
  }
}

/*planta = toSignal(
    this.plantaService.getPlantaByIdObservable(Number(this.id())),
    { initialValue: undefined }
  );*/

  /*planta = computed(()=>{
    const idNum = Number(this.id());
    return plantasDemo.find(p=> p.id ===idNum )
  })*/

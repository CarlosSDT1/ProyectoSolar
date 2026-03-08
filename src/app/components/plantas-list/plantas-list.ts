import { Component, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import Tabla from "../tabla/tabla";
import { Supaservice } from '../../services/supaservice';
import { planta } from '../../interface/planta.interface';
import { Pagination } from "../../shared/component/pagination/pagination";
import { PaginationService } from "../../shared/component/pagination/pagination.service";
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-plantas-list',
  imports: [Tabla, Pagination],
  templateUrl: './plantas-list.html',
})
export default class PlantasList {
  private supaservice: Supaservice = inject(Supaservice);
  private paginationService = inject(PaginationService);

  refreshTrigger = input<number>(0);

  plantas = signal<planta[]>([]);
  totalPages = signal<number>(0);
  totalPlantas = signal<number>(0);

  currentPage = this.paginationService.currentPage;

  searchTerm = toSignal(this.supaservice.getSearchObservable(), {
    initialValue: ''
  });

  action = output<{action: 'editar' | 'eliminar' | 'nueva', planta: planta}>();

  constructor() {
    effect(() => {
      const page = this.currentPage();
      this.loadPlantas(page);
    });

    effect(() => {
      this.refreshTrigger();
      this.loadPlantas(this.currentPage());
    });

    effect(() => {
      this.searchTerm();
      this.loadPlantas(1);
    });
  }

  async loadPlantas(page: number): Promise<void> {
    try {
      const search = this.supaservice.getSearchString();

      const response = await firstValueFrom(
        this.supaservice.getPlantasPaginatedFiltered(search, page, 5)
      );

      this.plantas.set(response.data);
      this.totalPages.set(response.pages);
      this.totalPlantas.set(response.total);
    } catch (error) {
      console.error('Error cargando plantas:', error);
    }
  }

  async ngOnInit(): Promise<void> {
    await this.loadPlantas(this.currentPage());
  }

  onAction(event: {action: 'editar' | 'eliminar', planta: planta}) {
    this.action.emit(event);
  }

  createPlanta() {
    this.action.emit({
      action: 'nueva',
      planta: {} as planta
    });
  }
}

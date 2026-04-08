import { Component, effect, inject, input, signal } from '@angular/core';
import { PlantaInformation } from "./planta-information/planta-information";
import { Supaservice } from '../../../../core/services/supaservice';
import { PaginationService } from '../../../../shared/component/pagination/pagination.service';
import { AuthService } from '../../../auth/services/authservice';
import { registre } from '../../../../shared/interface/registre.interface';
import { NotFound } from '../../../main/pages/not-found/not-found';
import { AdminRegistreEdit } from '../../../auth/pages/admin-registre-edit/admin-registre-edit';


@Component({
  selector: 'app-plantes-detall',
  imports: [PlantaInformation, NotFound, AdminRegistreEdit],
  templateUrl: './plantes-detall.html',
})
export class PlantesDetall {
  id = input<string>();

  private plantaService = inject(Supaservice);
  private paginationService = inject(PaginationService);
  private authService = inject(AuthService);

  planta = signal<any>(undefined);
  registres = signal<registre[]>([]);
  chartRegistres = signal<registre[]>([]);
  totalPages = signal<number>(0);
  totalRegistres = signal<number>(0);

  showRegistreForm = signal<boolean>(false);
  currentRegistre = signal<registre | null>(null);

  myRole = signal<string>('user');
  canManage = signal<boolean>(false);

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

      const allRegistres = await this.plantaService.getAllRegistresByPlanta(idNum);
      this.chartRegistres.set(allRegistres);

      await this.loadPermissions();
    }
  }

  async loadPermissions() {
    try {
      const session = this.authService.loggedSubject.getValue();
      const uid = session?.user?.id;

      if (!uid || !this.planta()) {
        this.myRole.set('user');
        this.canManage.set(false);
        return;
      }

      const profile = await this.plantaService.getMyProfile(uid);
      const role = profile?.role ?? 'user';

      this.myRole.set(role);
      this.canManage.set(role === 'admin' || this.planta().user === uid);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      this.canManage.set(false);
    }
  }

  async ngOnChanges(): Promise<void> {
    await this.loadPlantaAndRegistres();
  }

  openNewRegistreForm() {
    if (!this.canManage()) return;

    this.currentRegistre.set(null);
    this.showRegistreForm.set(true);
  }

  editRegistre(registre: registre) {
    if (!this.canManage()) return;

    this.currentRegistre.set(registre);
    this.showRegistreForm.set(true);
  }

  async deleteRegistre(registre: registre) {
    if (!this.canManage()) return;

    const confirmed = confirm('¿Estás seguro de que quieres eliminar este registro?');
    if (!confirmed) return;

    try {
      await this.plantaService.deleteRegistre(registre.id);
      await this.loadPlantaAndRegistres();
      console.log('Registro eliminado');
    } catch (error) {
      console.error('Error eliminando registro:', error);
    }
  }

  async onRegistreSaved(data: any) {
    if (!this.canManage()) return;

    try {
      const payload = {
        planta: Number(this.id()),
        generacio: data.generacio,
        consum: data.consum,
      };

      if (!data.id || data.id === 0) {
        await this.plantaService.createRegistre(payload);
        console.log('Registro creado');
      } else {
        await this.plantaService.updateRegistre(data.id, payload);
        console.log('Registro actualizado');
      }

      this.currentRegistre.set(null);
      this.showRegistreForm.set(false);
      await this.loadPlantaAndRegistres();
    } catch (error) {
      console.error('Error guardando registro:', error);
    }
  }

  onRegistreCancelled() {
    this.currentRegistre.set(null);
    this.showRegistreForm.set(false);
  }
}

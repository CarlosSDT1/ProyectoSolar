import { Component, inject, signal } from '@angular/core';
import PlantasList from "../plantas-list/plantas-list";
import { AdminTablaEdit } from "../admin-tabla-edit/admin-tabla-edit";
import { planta } from '../../interface/planta.interface';
import { Supaservice } from '../../services/supaservice';
import { AuthService } from '../../services/authservice';

type ProfileOption = {
  id: string;
  username: string | null;
};

@Component({
  selector: 'app-admin-tabla',
  imports: [PlantasList, AdminTablaEdit],
  templateUrl: './admin-tabla.html',
})
export default class AdminTabla {
  private supaservice = inject(Supaservice);
  private authService = inject(AuthService);

  currentPlanta = signal<planta>({} as planta);
  showEditForm = signal<boolean>(false);
  profiles = signal<ProfileOption[]>([]);
  refreshList = signal<number>(0);

  constructor() {
    this.loadProfiles();
  }

  async loadProfiles() {
    try {
      const data = await this.supaservice.getProfilesSupabase();
      this.profiles.set(data);
    } catch (error) {
      console.error('Error cargando profiles:', error);
    }
  }

  onAction(event: { action: 'editar' | 'eliminar' | 'nueva', planta: any }) {
    console.log('Acción recibida:', event);

    if (event.action === 'nueva') {
      const session = this.authService.loggedSubject.getValue();
      const uid = session?.user?.id ?? '';

      this.currentPlanta.set({
        id: 0,
        created_at: '' as any,
        nom: '',
        ubicacion: { latitude: 0, longitude: 0 },
        user: uid,
        foto: '',
        favorite: false,
        capacitat: 0,
      } as planta);

      this.showEditForm.set(true);
    } else if (event.action === 'editar') {
      this.currentPlanta.set(event.planta);
      this.showEditForm.set(true);
    } else if (event.action === 'eliminar') {
      this.deletePlanta(event.planta.id);
    }
  }

  async deletePlanta(id: number) {
    try {
      await this.supaservice.deletePlanta(id);
      this.refreshList.update(v => v + 1);
      console.log('Planta eliminada');
    } catch (error) {
      console.error('Error eliminando planta:', error);
    }
  }

  async onSaved(event: { data: any; file: File | null }) {
    try {
      const data = event.data;
      const file = event.file;

      const payload = {
        nom: data.nom,
        ubicacion: data.ubicacion,
        capacitat: data.capacitat,
        user: data.user,
        foto: data.foto,
        favorite: data.favorite,
      };

      let savedPlanta: planta;

      if (!data.id || data.id === 0) {
        savedPlanta = await this.supaservice.createPlanta(payload);
        console.log('Planta creada');
      } else {
        savedPlanta = await this.supaservice.updatePlanta(data.id, payload);
        console.log('Planta actualizada');
      }

      if (file) {
        const publicUrl = await this.supaservice.uploadImage(file, savedPlanta.id);
        await this.supaservice.updatePlanta(savedPlanta.id, { foto: publicUrl });
      }

      this.refreshList.update(v => v + 1);
      this.showEditForm.set(false);
      this.currentPlanta.set({} as planta);

    } catch (error) {
      console.error('Error guardando planta:', error);
    }
  }

  onCancelled() {
    this.showEditForm.set(false);
    this.currentPlanta.set({} as planta);
  }
}

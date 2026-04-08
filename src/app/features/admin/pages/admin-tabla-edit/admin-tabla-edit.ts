import { Component, input, linkedSignal, output, signal, WritableSignal } from '@angular/core';


import {
  form,
  required,
  minLength,
  min,
  max,
  FormField
} from '@angular/forms/signals';

import { JsonPipe } from '@angular/common';
import { planta } from '../../../../shared/interface/planta.interface';

type PlantaFormModel = {
  id: number;
  created_at: string;
  nom: string;
  ubicacion: {
    latitude: number;
    longitude: number;
  };
  user: string;
  foto: string;
  favorite: boolean;
  capacitat: number;
};

@Component({
  selector: 'app-admin-tabla-edit',
  standalone: true,
  imports: [JsonPipe, FormField],
  templateUrl: './admin-tabla-edit.html',
})
export class AdminTablaEdit {
  planta = input.required<planta>();
  profiles = input<{ id: string; username: string | null }[]>([]);
  isAdmin = input<boolean>(false);

  saved = output<{ data: PlantaFormModel; file: File | null }>();
  cancelled = output<void>();

  imagePreview: WritableSignal<string | ArrayBuffer | null> = signal(null);
  imageFile: WritableSignal<File | null> = signal(null);

  plantaModel = linkedSignal<PlantaFormModel>(() => {
    const p = this.planta();

    return {
      id: p?.id ?? 0,
      created_at: (p as any)?.created_at ?? '',
      nom: p?.nom ?? '',
      ubicacion: p?.ubicacion ?? { latitude: 0, longitude: 0 },
      capacitat: p?.capacitat ?? 0,
      user: p?.user ?? '',
      foto: p?.foto ?? '',
      favorite: p?.favorite ?? false,
    };
  });

  plantaForm = form(this.plantaModel, (schema) => {
    required(schema.nom, { message: 'El nombre es obligatorio' });
    minLength(schema.nom, 3, { message: 'Mínimo 3 caracteres' });

    required(schema.capacitat, { message: 'La capacidad es obligatoria' });
    min(schema.capacitat, 100, { message: 'Capacidad mínima 100 kW' });
    max(schema.capacitat, 10000, { message: 'Capacidad máxima 10000 kW' });

    required(schema.user, { message: 'El usuario es obligatorio' });

    required(schema.ubicacion.latitude, { message: 'Latitud obligatoria' });
    min(schema.ubicacion.latitude, -90, { message: 'Latitud mínima -90' });
    max(schema.ubicacion.latitude, 90, { message: 'Latitud máxima 90' });

    required(schema.ubicacion.longitude, { message: 'Longitud obligatoria' });
    min(schema.ubicacion.longitude, -180, { message: 'Longitud mínima -180' });
    max(schema.ubicacion.longitude, 180, { message: 'Longitud máxima 180' });
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    this.imageFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result);
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    const data = this.plantaModel();

    this.saved.emit({
      data,
      file: this.imageFile()
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}

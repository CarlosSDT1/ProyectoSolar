import { Component, input, linkedSignal, output } from '@angular/core';
import {
  form,
  required,
  min,
  max,
  FormField
} from '@angular/forms/signals';
import { registre } from '../../../../shared/interface/registre.interface';


type RegistreFormModel = {
  id: number;
  created_at: string;
  planta: number;
  generacio: number;
  consum: number;
};

@Component({
  selector: 'app-admin-registre-edit',
  standalone: true,
  imports: [FormField],
  templateUrl: './admin-registre-edit.html',
})
export class AdminRegistreEdit {
  plantaId = input.required<number>();
  registre = input<registre | null>(null);

  saved = output<RegistreFormModel>();
  cancelled = output<void>();

  registreModel = linkedSignal<RegistreFormModel>(() => {
    const r = this.registre();

    return {
      id: r?.id ?? 0,
      created_at: r?.created_at ?? '',
      planta: r?.planta ?? this.plantaId(),
      generacio: r?.generacio ?? 0,
      consum: r?.consum ?? 0,
    };
  });

  registreForm = form(this.registreModel, (schema) => {
    required(schema.generacio, { message: 'La generación es obligatoria' });
    min(schema.generacio, 0, { message: 'La generación mínima es 0' });
    max(schema.generacio, 100000, { message: 'La generación máxima es 100000' });

    required(schema.consum, { message: 'El consumo es obligatorio' });
    min(schema.consum, 0, { message: 'El consumo mínimo es 0' });
    max(schema.consum, 100000, { message: 'El consumo máximo es 100000' });
  });

  onSubmit() {
    const data = this.registreModel();

    this.saved.emit({
      id: data.id,
      created_at: data.created_at,
      planta: data.planta,
      generacio: data.generacio,
      consum: data.consum,
    });
  }

  onCancel() {
    this.cancelled.emit();
  }

  isEditing(): boolean {
    return !!this.registre()?.id;
  }
}

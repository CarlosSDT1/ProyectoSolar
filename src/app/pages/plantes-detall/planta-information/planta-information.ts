import {
  Component,
  ElementRef,
  effect,
  input,
  OnDestroy,
  output,
  viewChild
} from '@angular/core';
import { planta } from '../../../interface/planta.interface';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { registre } from '../../../interface/registre.interface';
import { Pagination } from "../../../shared/component/pagination/pagination";
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-planta-information',
  imports: [DecimalPipe, RouterLink, DatePipe, Pagination],
  templateUrl: './planta-information.html',
})
export class PlantaInformation implements OnDestroy {
  planta = input.required<planta>();
  registres = input.required<registre[]>();
  chartRegistres = input.required<registre[]>();
  totalPages = input.required<number>();
  currentPage = input.required<number>();
  canManage = input<boolean>(false);

  newRegistre = output<void>();
  editRegistre = output<registre>();
  deleteRegistre = output<registre>();

  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('grafico');
  private chart: Chart | null = null;

  constructor() {
    effect(() => {
      const canvasRef = this.canvas();
      if (!canvasRef) return;

      this.chart?.destroy();

      this.chart = new Chart(canvasRef.nativeElement, {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    });

    effect(() => {
      const registros = this.chartRegistres();
      if (!this.chart) return;

      const labels = registros.map(r => {
        const date = new Date(r.created_at);
        return date.toLocaleString();
      });

      this.chart.data = {
        labels,
        datasets: [
          {
            label: 'Generación',
            data: registros.map(r => r.generacio),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Consumo',
            data: registros.map(r => r.consum),
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      };

      this.chart.update();
    });
  }

  createRegistre() {
    if (!this.canManage()) return;
    this.newRegistre.emit();
  }

  onEditRegistre(registre: registre) {
    if (!this.canManage()) return;
    this.editRegistre.emit(registre);
  }

  onDeleteRegistre(registre: registre) {
    if (!this.canManage()) return;
    this.deleteRegistre.emit(registre);
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}

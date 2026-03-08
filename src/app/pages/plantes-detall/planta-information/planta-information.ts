import { Component, input } from '@angular/core';
import { planta } from '../../../interface/planta.interface';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { registre } from '../../../interface/registre.interface';
import { Pagination } from "../../../shared/component/pagination/pagination";

@Component({
  selector: 'app-planta-information',
  imports: [DecimalPipe, RouterLink, DatePipe, Pagination],
  templateUrl: './planta-information.html',
})
export class PlantaInformation {
  planta = input.required<planta>();
  registres = input.required<registre[]>();
  totalPages = input.required<number>();
  currentPage = input.required<number>();
}

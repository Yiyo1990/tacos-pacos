import { Component } from '@angular/core';
import { MainService } from 'src/app/main/main.service';
import { ProvidersService } from './providers.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { NgFor, NgIf } from '@angular/common';
import { Dates } from 'src/app/util/Dates';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule,MatIconModule,MatButtonModule, MatTooltipModule, MatIconModule, NgFor,NgIf,MatButtonToggleModule]
})
export class SupplierComponent {
  columnsTable: string[] = ['Id', 'Proveedor', 'Categoría', 'Fecha', 'Acciones']
  columnsName: string[] = this.columnsTable.slice()
  dataTable:any = []
  dates = new Dates()

  constructor(private mainService: MainService, private service:ProvidersService){
    mainService.setPageName("Proveedores")
    service.getProviders().subscribe({
      next: (resp:any) => {
        const tmp = resp.map((item:any) => {
          return {Id: item.id, Proveedor: item.name, Categoría: item.foodCategories.name, Fecha: this.dates.getFormatDate(item.createdAt) }
        })

        this.dataTable = tmp
      },
      error: (error) => {
        console.log('Error: ', error);
      }
    })
  }
}

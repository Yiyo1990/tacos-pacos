import { Component, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';
import { ProvidersService } from './providers.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { NgFor, NgIf } from '@angular/common';
import { Dates } from 'src/app/util/Dates';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { configDropdown } from 'src/app/util/util';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule, MatTooltipModule, MatIconModule, NgFor, NgIf, MatButtonToggleModule, SelectDropDownModule, FormsModule]
})
export class SupplierComponent {
  modalRef?: BsModalRef;
  foodCategories: any = []
  readonly configDrodown = configDropdown
  brandSelected: any

  columnsTable: string[] = ['Id', 'Proveedor', 'Categoría', 'Fecha', 'Acciones']
  columnsName: string[] = this.columnsTable.slice()
  dataTable: any = []
  dates = new Dates()
  provider: any = { id: null, name: '', foodCategories: { id: null } }
  providerList: any = []

  constructor(private mainService: MainService, private service: ProvidersService, private modalService: BsModalService, private toastr: ToastrService) {
    mainService.setPageName("Proveedores")
    this.getProviders()
    this.mainService.$foodCategories.subscribe((result: any) => {
      if (result) {
        this.foodCategories = result
      }
    })

    this.mainService.$brandSelected.subscribe((result: any) => {
      this.brandSelected = JSON.parse(result)
    })
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  closeModal() {
    this.modalRef?.hide()
  }

  onChangeCategory(e: any) {

  }

  saveSupplier() {
    if(!this.provider.name || Object.keys(this.provider.foodCategories).length == 0) {
      this.toastr.info("Favor de ingresar todos los datos", "Error")
    } else {
      this.service.saveProvider(this.provider, this.brandSelected.id).subscribe({
        next: (res: any) => {
          if (res.acknowledge) {
            this.toastr.success("El proveedor se ha registrado correctamente!", "Success")
            this.modalRef?.hide()
          } else {
            this.toastr.error("Ha ocurrido un error", "Error")
          }
        },
        error: () => {
          this.toastr.error("Ha ocurrido un error", "Error")
        },
        complete: () => {
          this.getProviders()
          this.resetProviderData()
        }
      })
    }
  }

  resetProviderData() {
    this.provider.id = null
    this.provider.name = ''
    this.provider.foodCategories = {}
  }

  getProviders() {
    this.service.getProviders().subscribe({
      next: (resp: any) => {
        this.providerList = resp
        const tmp = resp.map((item: any) => {
          return { Id: item.id, Proveedor: item.name, Categoría: item.foodCategories.name, Fecha: this.dates.getFormatDate(item.createdAt) }
        })
        this.dataTable = tmp
      },
      error: () => {
        this.toastr.error("Ha ocurrido un error", "Error")
      }
    })
  }

  editProvider(item: any, template: any) {
    let providerFind = this.providerList.find((provider: any) => provider.id == item.Id)
    this.provider.id = providerFind.id
    this.provider.name = providerFind.name
    this.provider.foodCategories = providerFind.foodCategories
    this.openModal(template)
  }

  deleteProvider(item: any) {
    let providerFind = this.providerList.find((provider: any) => provider.id == item.Id)
    let resp = confirm(`¿Esta seguro de eliminar el proveedor '${providerFind.name}'?`)
    if (resp) {
      this.service.deleteProvider(this.brandSelected.id, providerFind.id).subscribe({
        next: (res: any) => {
          if (res.acknowledge) {
            this.toastr.success("El proveedor se ha eliminado correctamente", "Success")
          } else {
            this.toastr.error("Ha ocurrido un error", "Error")
          }
        },
        error: () => {
          this.toastr.error("Ha ocurrido un error", "Error")
        },
        complete: () => {
          this.getProviders()
        }
      })
    }
  }
}

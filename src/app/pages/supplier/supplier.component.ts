import { Component, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';
import { ProvidersService } from './providers.service';
import { Dates } from 'src/app/util/Dates';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Pages, configDropdown, groupArrayByKey, sortByKey } from 'src/app/util/util';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/components/loading/loading.service';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
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
  isEnabledRegisterSup: boolean = true

  constructor(private mainService: MainService, 
    private service: ProvidersService, 
    private modalService: BsModalService, 
    private toastr: ToastrService,
    private loading: LoadingService) {
    mainService.setPageName(Pages.SUPPLIER)
    
    this.mainService.$foodCategories.subscribe((result: any) => {
      if (result) {
        this.foodCategories = result
      }
    })

    this.mainService.$brandSelected.subscribe((result: any) => {
      this.brandSelected = JSON.parse(result)
      this.getProviders()
    })
  }

  openModal(template: TemplateRef<any>, isEnabledRegisterSup: boolean = true) {
    this.isEnabledRegisterSup = isEnabledRegisterSup
    this.modalRef = this.modalService.show(template)
  }

  closeModal() {
    this.modalRef?.hide()
  }

  saveSupplier() {
    this.loading.start()
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
          this.loading.stop()
        },
        complete: () => {
          this.loading.stop()
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
    this.loading.start()
    this.service.getProviders(this.brandSelected.id).subscribe({
      next: (resp: any) => {
        const tmp = resp.map((item: any) => {
          return { ...item, categoryCode: item.foodCategories.code, categoryName: item.foodCategories.name, fecha: this.dates.getFormatDate(item.createdAt) }
        })
        this.providerList = tmp
      },
      error: () => {
        this.loading.stop()
        this.toastr.error("Ha ocurrido un error", "Error")
      },
      complete: () => {
        this.loading.stop()
      }
    })
  }

  editProvider(item: any, template: any) {
    let providerFind = this.providerList.find((provider: any) => provider.id == item.id)
    this.provider.id = providerFind.id
    this.provider.name = providerFind.name
    this.provider.foodCategories = providerFind.foodCategories
    this.openModal(template)
  }

  deleteProvider(item: any) {
    let providerFind = this.providerList.find((provider: any) => provider.id == item.id)
    let resp = confirm(`¿Esta seguro de eliminar el proveedor '${providerFind.name}'?`)
    if (resp) {
      this.loading.start()
      this.service.deleteProvider(this.brandSelected.id, providerFind.id).subscribe({
        next: (res: any) => {
          if (res.acknowledge) {
            this.toastr.success("El proveedor se ha eliminado correctamente", "Success")
          } else {
            this.toastr.error("Ha ocurrido un error", "Error")
          }
        },
        error: () => {
          this.loading.stop()
          this.toastr.error("Ha ocurrido un error", "Error")
        },
        complete: () => {
          this.loading.stop()
          this.getProviders()
        }
      })
    }
  }

  get suppliersByCategory() : Array<any> {
    
    let checkOrder: Array<any> = []
    let grouping = groupArrayByKey(this.providerList, "categoryName")
    Object.keys(grouping).map((s: any) => {
      checkOrder.push({name: s, lenght: grouping[s].length})
    })

    let orderArray = sortByKey(checkOrder, "lenght").map((k: any) => {
      return {...k, data: grouping[k.name]}
    })

    return orderArray
  }

  onClickActionEvent($event: any, template: any) {
    if($event.type == 0) {
      this.deleteProvider($event.item)
    } else {
      this.editProvider($event.item, template)
    }
  }

  onClickAddCategory(item: any, template: any) {
    this.provider.foodCategories = item.data[0].foodCategories
    this.openModal(template, false)
  }

  onClickRegisterSup(template: any) {
    this.resetProviderData()
    this.openModal(template)
  }
}

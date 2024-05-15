import { Component, OnInit } from '@angular/core';
import { Pages, configDropdown } from '@util/util';
import { MainService } from 'src/app/main/main.service';
import { InsumoService } from './insumo.service';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InsumosCatalogo, Insumo, InsumosUnidadMedida } from './Insumo';

@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.scss']
})
export class InsumosComponent implements OnInit {
  readonly configDrodown = configDropdown
  modalRef?: BsModalRef;

  currentBranch: any
  insumosList: any = {}
  unidadMedidaList: Array<any> = []
  catalogoInsumoList: Array<any> = []
  insumoSave = new Insumo(0, "", 0, 0, new InsumosUnidadMedida(), new InsumosCatalogo())

  insumoCategories: Array<any> = []
  isEnabledCatalogs: boolean = true

  constructor(private mainService: MainService,
    private service: InsumoService,
    private loading: LoadingService,
    private toast: ToastrService,
    private modalService: BsModalService
  ) {
    mainService.setPageName(Pages.INSUMOS)
  }


  ngOnInit() {
    this.currentBranch = JSON.parse(this.mainService.currentBranch)
    this.getInsumos()
    this.getUnidadMedida()
    this.getCatalogoInsumos()
  }

  /**
   * Llama servicio para guardar los insumos
   */
  saveInsumo() {
    if (this.insumoSave.ingrediente == "") {
      this.toast.error("Ingrese el ingrediente")
    } else if (this.insumoSave.catalogo.id == 0) {
      this.toast.error("Seleccione un catalogo")
    } else if (this.insumoSave.unidad.id == 0) {
      this.toast.error("Seleccione una UM")
    } else {
      let data: any = { ...this.insumoSave }
      data.costo = typeof this.insumoSave.costoStr == 'string' ? Number(this.insumoSave.costoStr.replace("$", "")) : this.insumoSave.costoStr
      data.unidadId = this.insumoSave.unidad.id
      data.insumoCatalogoId = this.insumoSave.catalogo.id
      this.service.saveInsumo(data, this.currentBranch.id).subscribe({
        next: (res: any) => {
          if (res.acknowledge) {
            this.toast.success("El isumo se ha guardado correctamente!")
            this.closeModal()
            this.getInsumos()
          } else {
            this.toast.error("Ocurrio un error al guardar el isumo, intente de nuevo!")
          }
        },
        error: () => {
          this.toast.error("Ocurrio un error al guardar el isumo, intente de nuevo!")
        }
      })
    }
  }

  /**
   * Abre modal para registro y edicion de insumos
   * @param template 
   */
  openModal(template: any) {
    this.modalRef = this.modalService.show(template)
  }

  /**
   * Cierra modal para registro y edicion de insumos
   */
  closeModal() {
    this.modalRef?.hide()
  }


  /**
   * Retorna lista para el llenado de los catalogos en vista
   */
  get insumosCatalogs() {
    return this.catalogoInsumoList.map((c: any) => {
      return { id: c.id, name: c.name, data: this.getDataInsumoByCatalog(c.name) }
    })
  }

  /**
   * Retorna Lista para el llenado de la data de los insumos por catalogo
   * @param catalogName 
   * @returns 
   */
  getDataInsumoByCatalog(catalogName: string): Array<any> {
    let filter = this.insumosList[catalogName]
    return filter ? filter.map((c: any) => {
      return new Insumo(c.id, c.ingrediente, c.costo, c.costo,
        new InsumosUnidadMedida(c.insumosUnidadMedida.id, c.insumosUnidadMedida.name),
        new InsumosCatalogo(c.insumosCatalogo.id, c.insumosCatalogo.name)
      )
    }) : []
  }


  /**
   * Evento click en acciones en tablas insumos
   * @param e 
   */
  onClickActionEvent($event: any, template: any){
    if($event.type == 0) {
      this.confirmDeleteInsumo($event.item)
    } else {
      this.insumoSave = $event.item
      this.openModal(template)
    }
  }

  /**
   * Evento click agregar nuevo insumo
   * @param e 
   */
  onClickAddCatalog($e: any, template: any) {
    this.isEnabledCatalogs = false
    let insumo = new Insumo(
      0, "", 0, 0, new InsumosUnidadMedida(), new InsumosCatalogo($e.id, $e.name)
    )
    this.insumoSave = insumo
    this.openModal(template)
  }

  onClickRegisterInsumo(template: any) {
    this.resetInsumo()
    this.openModal(template)
  }


  /**
   * Eliminar insumo
   * @param insumo 
   */
  confirmDeleteInsumo(insumo: Insumo) {
    let resp = confirm(`¿Esta seguro de eliminar el insumo '${insumo.ingrediente}'?`)
    if(resp) {
      this.service.deleteInsumo(insumo.id, this.currentBranch.id).subscribe({
        next: (res: any) => {
          if(res.acknowledge) {
            this.toast.success("El isumo se ha eliminado correctamente!")
            this.getInsumos()
          } else {
            this.toast.error("Ocurrio un error al eliminar el insumo.")
          }
        }, 
        error: () => {
          this.toast.error("Ocurrio un error al eliminar el insumo.")
        }
      })
    }
  }

  /**
   * Resetea los valores default del insumo a guardar
   */
  resetInsumo() {
    this.isEnabledCatalogs = true
    this.insumoSave = new Insumo(0, "", 0, 0, new InsumosUnidadMedida(), new InsumosCatalogo())
  }

  /**
   * Llama servicio para obtener el catalogo de insumos
   */
  async getCatalogoInsumos() {
    this.loading.start()
    this.service.getInsumoCatalogo(this.currentBranch.id).subscribe({
      next: (res: any) => {
        this.catalogoInsumoList = res.map((s: any) => { return { id: s.id, name: s.name } })
        this.loading.stop()
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error al obtener los catalogos de insumos")
      }
    })
  }

  /**
   * Llama servicio para obtener las unidades de medida
   */
  async getUnidadMedida() {
    this.loading.start()
    this.service.getUnidadMedida().subscribe({
      next: (res: any) => {
        this.unidadMedidaList = res.map((s: any) => { return { id: s.id, name: s.name } })
        this.loading.stop()
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error al obtener las unidades de medida.")
      }
    })
  }

  /**
   * Llama servcio para obtener el listado de insumos registrados.
   */
  async getInsumos() {
    this.loading.start()
    this.service.getInsumos(this.currentBranch.id).subscribe({
      next: (res: any) => {
        this.loading.stop()
        this.insumosList = res
        console.log(this.insumosList)
      },
      error: (res) => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error al obtener los insumos")
      }
    })
  }
}

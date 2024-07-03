import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MainService } from 'src/app/main/main.service';
import { CostAnalysisService } from './cost-analysis.service';
import { InsumoService } from '../insumos/insumo.service';
import { ToastrService } from 'ngx-toastr';
import { Guisado, GuisoCanal, GuisoPresentacion, convertObjectToArray, groupArrayByKey, isNumber } from '@util/util';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { ModalGuisadoComponent } from 'src/app/components/modal-guisado/modal-guisado.component';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html',
  styleUrls: ['./cost-analysis.component.scss']
})
export class CostAnalysisComponent implements OnInit {
  @ViewChild(ModalGuisadoComponent) modalComponent!: ModalGuisadoComponent

  showTable: boolean = true;
  modalRef?: BsModalRef;
  currentBranch: any
  insumosList: Array<any> = []
  categoriesList: Array<any> = []
  unidadMedidaId: number = 0
  isTabTaco: boolean = true
  guisosList: Array<any> = []
  guisoEdit: any = {}

  public tacosList: Array<any> = []

  gorditasList: Array<any> = []

  public mainHedaer: Array<any> = [
    // { id: 1, name: "Costo", name2: "60%", name3: "Venta", name4: "%" }
  ]

  constructor(
    private mainService: MainService,
    private modalService: BsModalService,
    private service: CostAnalysisService,
    private insumoService: InsumoService,
    private toast: ToastrService,
    private loading: LoadingService
  ) {
    mainService.setPageName("Análisis")
  }

  ngOnInit(): void {
    this.currentBranch = JSON.parse(this.mainService.currentBranch)
    this.getGuisados()
    this.getInsumoList()
    this.callCategoriesService()
    this.getUnidadMedida()
  }

  calcularAnchoColumna(): void {
    this.mainHedaer = []
    const resColm = (this.tacosList.length / 9)
    for (let index = 0; index <= resColm; index++) {
      this.mainHedaer.push({ id: 1, name: "Costo", name2: "60%", name3: "Venta", name4: "%" })
    }
  }

  async getGuisados() {
    this.loading.start()
    this.service.getGuisos(this.currentBranch.id).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.guisosList = res
          this.tacosList = []
          this.gorditasList = []
          this.tacosList = this.fillListItems(res, GuisoPresentacion.TACO)
          this.gorditasList = this.fillListItems(res, GuisoPresentacion.GORDITA)
        }
        this.calcularAnchoColumna();
        this.loading.stop()
      },
      error: (e) => {
        this.loading.stop()
        this.toast.error("Ocurrio un error al obtener los guisos")
      }
    })
  }

  fillListItems(list: Array<any>, presentacion: GuisoPresentacion): Array<any> {
    let resultList: Array<any> = []
    list.map((g: any) => {
      let guiso: any = {}
      let costoTaco = this.getCostoGuiso(g.guisoDetalle, this.getPiezas(g.cantidad, g.piezas))
      guiso.id = g.id
      guiso.name = g.nombre
      guiso.costo = presentacion == GuisoPresentacion.TACO ? costoTaco : this.getCostoGordita(costoTaco)
      guiso.percent60 = this.getpercent60Guiso(guiso.costo)

      guiso.venta = this.getVentaGuiso(g.guisoVenta, GuisoCanal.CHANNEL_COMEDOR, presentacion)
      guiso.percent = this.getPercentGuiso(guiso.venta, guiso.costo)
      resultList.push(guiso)
    })
    return resultList
  }

  getCostoGuiso(ingredientes: Array<any>, piezas: number): number {
    let suma = 0
    ingredientes.map((i: any) => {
      let total = i.cantidad * i.insumos.costo
      suma += total
    })
    return Number((suma / piezas).toFixed(2))
  }

  getCostoGordita(costoTaco: number) {
    return costoTaco + 1
  }

  getPiezas(litros: number, piezasxLitro: number) {
    return litros * piezasxLitro
  }

  getVentaGuiso(ventaList: Array<any>, canal: string, presentacion: string): number {
    let find = ventaList.find((i: any) => i.canal == canal && i.guisoPresentacion == presentacion)
    return find ? find.venta : 0
  }

  getpercent60Guiso(costo: number): number {
    return Number((costo / (1 - 0.6)).toFixed(2))
  }

  getPercentGuiso(venta: number, costo: number): number {
    return Math.round((1 - (costo / venta)) * 100)
  }

  /**
   *    let venta = !this.calComedorTaco.venta ? 0: this.calComedorTaco.venta
    return Math.round((venta != 0 ? (this.costoTaco / venta) : 0) * 100)
  }
   */

  /**
   * Evento click Registrar Guisado
   * @param template 
   */
  onClickRegisterGuisado(template: any) {
    this.guisoEdit = {}
    this.openModal(template)
  }

  /**
   * Obtiene el listado de ingredientes para hacer el registro de un guiso
   */
  getInsumoList() {
    this.insumoService.getInsumos(this.currentBranch.id).subscribe({
      next: (res: any) => {
        this.insumosList = convertObjectToArray(res)
      },
      error: () => {
        this.toast.error("Ocurrio un error al obtener los ingredientes.")
      }
    })
  }

  /**
   *  Llama serivicio para obtener el listado de guisos
   */
  callGuisosService() {

    this.service.getGuisos(this.currentBranch.id).subscribe({
      next: (res: any) => {
        console.log("resultado", res)
      },
      error: (e: any) => {
        console.error(e)
      }
    })
  }

  callCategoriesService() {
    this.insumoService.getInsumosCategories(this.currentBranch.id).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.categoriesList = res
        }
      },
      error: (e) => {
        console.log(e)
      }
    })
  }

  /**
   * 
   * @param template 
   */
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-xl', backdrop: 'static' })
  }

  /**
 * Cierra Modal para editar agregar guisado
 */
  closeModal() {
    this.modalRef?.hide()
  }

  /**
   * Evento para guardar los guisados
   * @param guiso 
   */
  saveGuiso(guiso: any) {
    this.loading.start()
    guiso.branchId = this.currentBranch.id
    guiso.unidadMedidaId = this.unidadMedidaId

    this.service.saveGuiso(guiso).subscribe({
      next: (resp: any) => {
        this.loading.stop()
        this.toast.success("El guiso se ha guardado con exito!")
        this.closeModal()
        this.getGuisados()
      },
      error: (e) => {
        this.loading.stop()
        this.toast.error("Ocurrio un error al guardar el guiso")
      }
    })
  }

  editGuiso(guiso: any, template: any) {
    this.guisoEdit = this.guisosList.find((g: any) => g.id == guiso.id)
    this.openModal(template)
  }

  getUnidadMedida() {
    this.insumoService.getUnidadMedida().subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          let un = res.find((u: any) => u.name == "Litro")
          if (un) {
            this.unidadMedidaId = un.id
          } else {
            this.toast.error("No se encontro la unidad de medida 'Litro'")
          }
        }
      },
      error: () => {
        this.toast.error("Ocurrio un error al obtener las unidades de medida")
      }
    })
  }

  deleteGuisado(guiso: any){
    this.loading.start()
    this.service.deleteGuiso(guiso.id, this.currentBranch.id).subscribe({
      next: (res: any) => {
        this.loading.stop()
        this.toast.success("El guiso se ha eliminado correctamente!")
        this.closeModal()
        this.getGuisados()
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error al eliminar el guiso")
      }
    })
  }

} 

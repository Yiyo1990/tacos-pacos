import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Guisado, GuisadoCalculadora, GuisoCanal, GuisoDetalle, GuisoPresentacion, GuisoVenta, isNumber } from '@util/util';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../loading/loading.service';
import { CostAnalysisService } from 'src/app/pages/cost-analysis/cost-analysis.service';

@Component({
  selector: 'modal-guisado',
  templateUrl: './modal-guisado.component.html',
  styleUrls: ['./modal-guisado.component.scss']
})
export class ModalGuisadoComponent implements OnInit {

  isTabIngrediente: boolean = true

  @Input() branchId!: number
  @Input() insumos: Array<any> = []
  @Input() categorias: Array<any> = []
  @Input() guisoEdit: any = {}
  @Output() closeModalEvent: EventEmitter<any> = new EventEmitter()
  @Output() saveEvent: EventEmitter<any> = new EventEmitter()
  @Output() deleteEvent: EventEmitter<any> = new EventEmitter()

  guisoName: string = ""
  litros: number = 0
  piezasXlitro: number = 0
  // piezas: number = 0
  ingredienteList: Array<any> = []
  guisoId: any = null
  isEdit: boolean = false

  calComedorTaco: GuisadoCalculadora = new GuisadoCalculadora(GuisoPresentacion.TACO, GuisoCanal.CHANNEL_COMEDOR)
  calComedorGordita: GuisadoCalculadora = new GuisadoCalculadora(GuisoPresentacion.GORDITA, GuisoCanal.CHANNEL_COMEDOR)
  calAppTaco: GuisadoCalculadora = new GuisadoCalculadora(GuisoPresentacion.TACO, GuisoCanal.CHANNEL_APLICACION)
  calAppGordita: GuisadoCalculadora = new GuisadoCalculadora(GuisoPresentacion.GORDITA, GuisoCanal.CHANNEL_APLICACION)


  constructor(private toast: ToastrService, private loading: LoadingService, private costService: CostAnalysisService) { }

  ngOnInit(): void {
    if (Object.keys(this.guisoEdit).length > 0) {
      this.isEdit = true
      this.editarGuisado()
    }
  }

  saveGuisado() {
    if (!this.guisoName) {
      this.toast.error("Ingrese el nombre del Guisado!")
    } else if (!this.litros || this.litros == 0 || !isNumber(this.litros)) {
      this.toast.error("Ingrese una cantidad de litros valida.")
    } else if (!this.piezasXlitro || this.piezasXlitro == 0 || !isNumber(this.piezasXlitro)) {
      this.toast.error("Ingrese una cantidad de piezas x valida.")
    } else if (this.ingredienteList.length == 0) {
      this.toast.error("Ingrese algunos ingredientes.")
    } else if (!this.isValidIngredientes()) {
      this.toast.error("Revise el listado de Ingredientes.")
    } else {
      //this.getIngredientes()

      let guisado: any = {}
      if (this.isEdit) {
        guisado.id = this.guisoId
      }
      guisado.nombreGuiso = this.guisoName
      guisado.cantidad = Number(this.litros)
      guisado.piezas = Number(this.piezasXlitro)
      guisado.guisoDetalle = this.getIngredientes()
      guisado.guisoVenta = this.getVentaData()
      this.saveEvent.emit(guisado)
    }

  }

  editarGuisado() {
    this.guisoId = this.guisoEdit.id
    this.guisoName = this.guisoEdit.nombre
    this.litros = this.guisoEdit.cantidad
    this.piezasXlitro = this.guisoEdit.piezas

    let comeTaco = this.searchCanalPresentacion(GuisoCanal.CHANNEL_COMEDOR, GuisoPresentacion.TACO)
    let comeGor = this.searchCanalPresentacion(GuisoCanal.CHANNEL_COMEDOR, GuisoPresentacion.GORDITA)
    let appTaco = this.searchCanalPresentacion(GuisoCanal.CHANNEL_APLICACION, GuisoPresentacion.TACO)
    let appGor = this.searchCanalPresentacion(GuisoCanal.CHANNEL_APLICACION, GuisoPresentacion.GORDITA)

    this.calComedorTaco.venta = comeTaco.venta
    this.calComedorTaco.id = comeTaco.id
    this.calComedorGordita.venta = comeGor && comeGor.venta! ? comeGor.venta : 0
    this.calComedorGordita.id = comeGor && comeGor.id! ? comeGor.id : null
    this.calAppTaco.venta = appTaco && appTaco.venta! ? appTaco.venta : 0
    this.calAppTaco.id = appTaco && appTaco.id! ? appTaco.id : null
    this.calAppGordita.venta = appGor && appGor.venta! ? appGor.venta : 0
    this.calAppGordita.id = appGor && appGor.id! ? appGor.id : null

    let ingredientes: Array<any> = this.guisoEdit.guisoDetalle
    ingredientes.map((ingr: any) => {

      let categoria = this.categorias.find((c: any) => c.id == ingr.insumos.insumosCatalogo.id)
      let insumos = this.insumos.find((insu: any) => insu.name == categoria.name)
      let insumo = insumos.data.find((insumo: any) => insumo.id == ingr.insumos.id)
      let um = insumo.insumosUnidadMedida

      let ingredienteEditar = {
        id: ingr.id,
        categoria: categoria,
        ingrediente: insumo,
        kgLt: insumo.costo,
        unidadM: um,
        qty: ingr.cantidad,
        precio: (insumo.costo * ingr.cantidad)
      }
      this.ingredienteList.push(ingredienteEditar)
    })
  }

  searchCanalPresentacion(canal: GuisoCanal, prese: GuisoPresentacion) {
    return this.guisoEdit.guisoVenta.find((c: any) => c.canal == canal && c.guisoPresentacion == prese)
  }

  isValidIngredientes(): boolean {
    let success = true

    for (let i = 0; i < this.ingredienteList.length; i++) {
      let ingrediente = this.ingredienteList[i]
      if (!ingrediente.categoria) {
        success = false
        break
      } else if (!ingrediente.ingrediente) {
        success = false
        break
      } else if (!ingrediente.qty || ingrediente.qty == 0) {
        success = false
        break
      }
    }
    return success
  }

  get totalPriceGuisado() {
    return this.ingredienteList.reduce((total: number, item: any) => total + item.precio, 0)
  }

  get precioXlitro() {
    return this.totalPriceGuisado / this.litros
  }

  get piezas(): number {
    return this.litros * this.piezasXlitro
  }

  closeModal() {
    this.closeModalEvent.emit()
  }

  onChangeIngredienteValues(event: any) {
    this.ingredienteList[event.id] = event
  }

  /**
 * Evento para agreguar un row ingrediente
 */
  onAddIngrediente() {
    // 
    let ingrediente = {
      //id: 0,
      categoria: {},
      ingrediente: {},
      kgLt: 0,
      unidadM: {},
      qty: 0,
      precio: 0
    }
    this.ingredienteList.push(ingrediente)
  }

  get costoTaco() {
    return this.totalPriceGuisado / this.piezas
  }

  get costoGordita(): number {
    return this.costoTaco + 1
  }

  get percent60Taco(): number {
    return Number((this.costoTaco / (1 - 0.6)).toFixed(2))
  }

  get percent60Gordita(): number {
    return Number((this.costoGordita / (1 - 0.6)).toFixed(2))
  }

  get ingresoTaco(): number {
    return Number((Number(this.calAppTaco.venta) * 0.60).toFixed(2))
  }

  get ingresoGordita(): number {
    return Number((Number(this.calAppGordita.venta) * 0.60).toFixed(2))
  }

  get percentTacoComedor(): number {
    let venta = !this.calComedorTaco.venta ? 0 : this.calComedorTaco.venta
    return Math.round((venta != 0 ? (1 - (this.costoTaco / venta)) : 0) * 100)
  }

  get percentGorditaComedor(): number {
    let venta = !this.calComedorGordita.venta ? 0 : this.calComedorGordita.venta
    return Math.round((venta != 0 ? (1 - (this.costoGordita / venta)) : 0) * 100)
  }


  get percentTacoApp(): number {
    return Math.round((1 - (this.ingresoTaco != 0 ? (this.costoTaco / this.ingresoTaco) : 0)) * 100)
  }

  get percentGorditaApp(): number {
    return Math.round((1 - (this.ingresoGordita != 0 ? (this.costoGordita / this.ingresoGordita) : 0)) * 100)
  }

  get utilidadTacoComedor(): number {
    let venta = !this.calComedorTaco.venta ? 0 : this.calComedorTaco.venta
    return Number((venta - this.costoTaco).toFixed(2))
  }

  get utilidadGorditaComedor(): number {
    let venta = !this.calComedorGordita.venta ? 0 : this.calComedorGordita.venta
    return Number((venta - this.costoGordita).toFixed(2))
  }

  get utilidadTacoApp(): number {
    return Number((this.ingresoTaco - this.costoTaco).toFixed(2))
  }

  get utilidadGorditaApp(): number {
    return Number((this.ingresoGordita - this.costoGordita).toFixed(2))
  }

  getIngredientes(): Array<any> {
    let detalles: any[] = []
    this.ingredienteList.map((i: any) => {
      let ingrediente: any = {}
      if (this.isEdit) {
        ingrediente.id = i.id
      }
      ingrediente.insumoId = i.ingrediente.id
      ingrediente.cantidad = i.qty
      detalles.push(ingrediente)
    })

    return detalles
  }

  getVentaData(): Array<any> {
    let guisos: any[] = []

    let tacoComedor: any = {}
    if (this.isEdit) {
      tacoComedor.id = this.calComedorTaco.id
    }
    tacoComedor.venta = Number(this.calComedorTaco.venta)
    tacoComedor.guisoPresentacion = this.calComedorTaco.guisoPresentacion
    tacoComedor.guisoCanal = this.calComedorTaco.guisoCanal
    tacoComedor.ingreso = 0

    let gorComedor: any = {}
    if (this.isEdit) {
      gorComedor.id = this.calComedorGordita.id
    }
    gorComedor.venta = Number(this.calComedorGordita.venta)
    gorComedor.guisoPresentacion = this.calComedorGordita.guisoPresentacion
    gorComedor.guisoCanal = this.calComedorGordita.guisoCanal
    gorComedor.ingreso = 0

    let tacoApp: any = {}
    if (this.isEdit) {
      tacoApp.id = this.calAppTaco.id
    }
    tacoApp.venta = Number(this.calAppTaco.venta)
    tacoApp.guisoPresentacion = this.calAppTaco.guisoPresentacion
    tacoApp.guisoCanal = this.calAppTaco.guisoCanal
    tacoApp.ingreso = 0

    let gorApp: any = {}
    if (this.isEdit) {
      gorApp.id = this.calAppGordita.id
    }
    gorApp.venta = Number(this.calAppGordita.venta)
    gorApp.guisoPresentacion = this.calAppGordita.guisoPresentacion
    gorApp.guisoCanal = this.calAppGordita.guisoCanal
    gorApp.ingreso = 0

    guisos.push(tacoComedor, gorComedor, tacoApp, gorApp)

    return guisos
  }

  deleteGuiso() {
    this.deleteEvent.emit(this.guisoEdit)
  }


  deleteIngrediente(e: any) {
    this.loading.start()
    this.costService.deleteIngrediente(e.id, this.branchId).subscribe({
      next: (res: any) => {
        this.loading.stop()
        this.toast.success("El ingrediente se ha eliminado correctamente!")
        let newList = this.ingredienteList.filter((i: any) => i.id != e.id)
        this.ingredienteList = newList
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error al eliminar el ingrediente")
      }
    })
  }
}


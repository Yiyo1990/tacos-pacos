import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { isNumber } from '@util/util';

export const CATEGORY_GUISO = {
  CATEGORY: "CATEGORY",
  GUISO: "GUISO"
}

@Component({
  selector: 'row-guisado',
  templateUrl: './row-guisado.component.html',
  styleUrls: ['./row-guisado.component.scss']
})

export class RowGuisadoComponent implements OnInit {
  //  @Output() checkedEvent : EventEmitter<any> = new EventEmitter()
  public ingredienteList: Array<any> = []
  public precioUni: number = 0
  @Input() id: number = 0
  @Input() rowNumber: number = 0
  @Input() insumoList: Array<any> = []
  @Input() ingrediente: any = {}
  @Input() categories: Array<any> = []

  @Output() onChangeSelectEvent: EventEmitter<any> = new EventEmitter()
  @Output() onDeleteRow: EventEmitter<any> = new EventEmitter()
  @Output() onChangeIngredienteValues: EventEmitter<any> = new EventEmitter()


  ngOnInit(): void {
    this.ingrediente.id = this.id
  }

  /**
   * Evento que se lanza cuando cambia la categoria
   * @param e 
   */
  onChangeCategory(e: any) {
    //this.ingredienteList = []
    this.ingredienteList = this.asignaIngredienteData(e)
    this.onChangeIngredienteValues.emit(this.ingrediente)
  }

  /**
   * 
   * @param idCategory 
   */
  asignaIngredienteData(idCategory:number) {
    let ingredientes = []
    let categoria = this.categories.find((i: any) => i.id == idCategory)
    if(categoria) {
      let cat = this.insumoList.find((c: any) => c.name == categoria.name)
      if(cat) {
        ingredientes = cat.data
        this.ingrediente.categoria = categoria
      }
    }
    
    return ingredientes
  }

  /**
   * Evento que se lanza cuando cambia de ingrediente
   * @param e 
   */
  onChangeIngrediente(e: any) {
    this.setIngredienteSelected(this.ingredienteList.find((i: any) => i.id == e))
  }

  /**
   * Evento que se lanza cuando cambia el valor cantidad
   * @param e 
   */
  onChangeQuantity(e:any) {
    if(isNumber(e)) {
      this.ingrediente.precio = this.ingrediente.kgLt * e
      this.ingrediente.qty = Number(e)
      this.onChangeIngredienteValues.emit(this.ingrediente)
    }
  }

  /**
   * 
   */
  onDeleteRowEvent() {
    this.onDeleteRow.emit(this.ingrediente)
  }

  /**
   * 
   * @param ing 
   */
  setIngredienteSelected(ing: any) {
    this.ingrediente.ingrediente = ing
    this.ingrediente.kgLt = ing.costo
    this.ingrediente.precio = 0
    this.ingrediente.qty = 0
    this.ingrediente.unidadM = ing.insumosUnidadMedida
    this.onChangeIngredienteValues.emit(this.ingrediente)
  }

  get ingredienteListData() {
    return this.asignaIngredienteData(this.ingrediente.categoria.id)
  }
}

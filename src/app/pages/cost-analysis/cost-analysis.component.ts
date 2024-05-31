import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MainService } from 'src/app/main/main.service';
import { CostAnalysisService } from './cost-analysis.service';
import { InsumoService } from '../insumos/insumo.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html',
  styleUrls: ['./cost-analysis.component.scss']
})
export class CostAnalysisComponent implements OnInit {
  showTable: boolean = true;
  modalRef?: BsModalRef;
  currentBranch: any
  insumosList: Array<any> = []

  public guisosList: Array<any> = [
    { id: 1, name: "Barbacoa", costo: 12.01, margen: 30.05, porcentaje: 22 },
    { id: 2, name: "Chicharron", costo: 7.09, margen: 17.73, porcentaje: 20 },
    { id: 3, name: "Deshebrada", costo: 6.62, margen: 16.55, porcentaje: 20 },
    { id: 4, name: "Asado", costo: 0, margen: 0, porcentaje: 20 },
    { id: 5, name: "Cortadillo", costo: 0, margen: 0, porcentaje: 20 },
    { id: 6, name: "PSV", costo: 0, margen: 0, porcentaje: 20 },
    { id: 7, name: "Bistec", costo: 0, margen: 0, porcentaje: 20 },
    { id: 8, name: "Combinado", costo: 0, margen: 0, porcentaje: 20 },
    { id: 9, name: "Machacado", costo: 0, margen: 0, porcentaje: 20 },
    { id: 10, name: "Jalapeño", costo: 12.02, margen: 30.05, porcentaje: 22 },
    { id: 11, name: "Rajas c", costo: 7.09, margen: 17.73, porcentaje: 20 },
    { id: 12, name: "Frijol c Queso", costo: 0, margen: 0, porcentaje: 20 },
    { id: 13, name: "Frijol c", costo: 0, margen: 0, porcentaje: 20 },
    { id: 14, name: "Huevo", costo: 0, margen: 0, porcentaje: 20 },
    { id: 15, name: "Papas", costo: 0, margen: 0, porcentaje: 20 },
    { id: 16, name: "Papas", costo: 0, margen: 0, porcentaje: 20 },
    { id: 17, name: "Nopales", costo: 0, margen: 0, porcentaje: 20 },
    { id: 18, name: "Quesadilla", costo: 0, margen: 0, porcentaje: 20 },
    //{ id: 14, name: "Huevo" , costo: 0, margen: 0, porcentaje: 20 },
    //{ id: 15, name: "Papas" , costo: 0, margen: 0, porcentaje: 20 },
    //{ id: 16, name: "Papas" , costo: 0, margen: 0, porcentaje: 20 },
    //{ id: 17, name: "Nopales" , costo: 0, margen: 0, porcentaje: 20 },
    //{ id: 18, name: "Quesadilla" , costo: 0, margen: 0, porcentaje: 20 }
  ]

  public mainHedaer: Array<any> = [
    // { id: 1, name: "Costo", name2: "60%", name3: "Venta", name4: "%" }
  ]

  constructor(
    private mainService: MainService,
    private modalService: BsModalService,
    private service: CostAnalysisService,
    private insumoService: InsumoService,
    private toast: ToastrService
  ) {
    mainService.setPageName("Análisis")
  }

  ngOnInit(): void {
    this.calcularAnchoColumna();
    this.currentBranch = JSON.parse(this.mainService.currentBranch)
    this.getInsumoList()
  }

  calcularAnchoColumna(): void {
    let numCol = 0;
    const resColm = (this.guisosList.length / 9)
    numCol = resColm + 2

    console.log(numCol)
    //if(resColm >= 1) {
    for (let index = 0; index < resColm; index++) {
      this.mainHedaer.push({ id: 1, name: "Costo", name2: "60%", name3: "Venta", name4: "%" })
    }
    //}


    //console.log("numFila =",this.mainHedaer)
    // return `repeat(${numCol}, calc((100% / 2)))`
  }




  /**
   * Evento click Registrar Guisado
   * @param template 
   */
  onClickRegisterGuisado(template: any) {
    // this.resetProviderData()
    this.openModal(template)
  }



  /**
   * Obtiene el listado de ingredientes para hacer el registro de un guiso
   */
  getInsumoList() {
    this.insumoService.getInsumos(this.currentBranch.id).subscribe({
      next: (res: any) => {
        this.insumosList = res
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


  /**
   * 
   * @param template 
   */
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-xl', backdrop: 'static' })
    // this.modalRef = this.modalService.show(template)
  }

  /**
   * Cierra Modal para editar agregar guisado
   */
  closeModal() {
    this.modalRef?.hide()
  }
}

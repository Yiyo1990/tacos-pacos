import { Component, TemplateRef } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { MainService } from 'src/app/main/main.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { configDropdown } from 'src/app/util/util';
import { ExpenseService } from './expenses.service';
import { Charts } from 'src/app/util/Charts';


@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class BillsComponent {
  brandSelected: any
  expensesList: any = []

  modalRef?: BsModalRef;
  readonly config = configDropdown

  billRegister = {
    categorySelected: {},
    providerSelected: {},
    operationSelected: {},
    monto: "",
    factura: false
  }


  foodCategories: any = []
  providerCategories: any = []
  operationCategories: any = []

  facturationChartData: any

  constructor(private service: ExpenseService, private mainService: MainService, private modalService: BsModalService) {
    mainService.setPageName("Gastos")
    this.getCatalogs()
    this.facturationChartData = Charts.Donut(['SI','NO'],[3,5])
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  getCatalogs() {
    this.mainService.$foodCategories.subscribe((result: any) => {
      if (result) {
        this.foodCategories = result.map((s: any) => { return { id: s.id, description: s.name } })
      }
    })

    this.mainService.$providersCategories.subscribe((result: any) => {
      if (result) {
        this.providerCategories = result.map((s: any) => { return { id: s.id, description: s.name } })
      }
    })

    this.mainService.$operationCategories.subscribe((result: any) => {
      if (result) {
        this.operationCategories = result.map((s: any) => { return { id: s.id, description: s.name } })
      }
    })

    this.mainService.$brandSelected.subscribe((result: any) => {
      this.brandSelected = JSON.parse(result)
      this.getExpenses()
    })
  }

  async getExpenses() {
    if (this.brandSelected) {
      this.service.getExpenses(this.brandSelected.id).subscribe({
        next: (result) => {
          if(Array.isArray(result)) {
            this.expensesList = result

           // let billing = result.map()

           
            console.log("expenses", result)
          }
        },
        error: (error) => { console.error(error) }
      })
    }
  }
}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartOptions, ChartType } from 'chart.js';
import { MainService } from 'src/app/main/main.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { barChartOptions, configDropdown, donutChartOptions } from 'src/app/util/util';
import { ExpenseService } from './expenses.service';
import { Charts } from 'src/app/util/Charts';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Dates } from 'src/app/util/Dates';
import { ActivatedRoute } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';
//import * as pluginDataLabels from 'chartjs-plugin-datalabels';
//import { default as ChartDataLabels  } from 'chartjs-plugin-datalabels';

@Component({
   selector: 'app-expenses',
   templateUrl: './expenses.component.html',
   styleUrls: ['./expenses.component.scss']
})
export class BillsComponent implements OnInit {
   brandSelected: any
   expensesList: any = []
   dateFilter: any
   private dates: Dates = new Dates()
   @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

   modalRef?: BsModalRef;
   readonly config = configDropdown

   sumaGastosTotales: number = 0
   billRegister: any = {}

   foodCategories: any = []
   providerCategories: any = []
   operationCategories: any = []

   facturationChartData: any

   dataSource!: MatTableDataSource<any>;
   columnas: string[] = ['Fecha', 'Dia', 'Categoria', 'Proveedor', 'Operación', 'Monto', 'Facturación', 'Acciones'];
   @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

   barChartOptions: ChartOptions = barChartOptions
   public barChartLegend = true;
   public barChartType: ChartType = 'bar';
   //public barChartPlugins = [pluginDataLabels];
   public donutChartOptions: ChartConfiguration['options'] = donutChartOptions

   public barChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Series A' }] };

   constructor(private service: ExpenseService, private mainService: MainService,
      private modalService: BsModalService, private toastr: ToastrService, private activeRouter: ActivatedRoute) {

      this.activeRouter.queryParams.subscribe((params: any) => {
         mainService.setPageName(params.nombre)
      })

      this.resetModalData()
      this.getCatalogs()
      this.dateFilter = this.dates.getStartAndEndYear(0)

      mainService.$filterMonth.subscribe((month: any) => {
         if (month) {
            this.dateFilter = month.id == 0 ? this.dates.getStartAndEndYear(0) : this.dates.getStartAndEndDayMonth(month.id)
            this.callServiceSearchExpenses('')
         }
      })
   }

   ngOnInit(): void {
   }

   openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, { id: 1, class: 'modal-lg', backdrop: 'static' })
   }

   closeModal() {
      this.modalRef?.hide()
      this.resetModalData()
   }

   getCatalogs() {
      this.mainService.$foodCategories.subscribe((result: any) => {
         if (result) {
            this.foodCategories = result
         }
      })

      this.mainService.$operationCategories.subscribe((result: any) => {
         if (result) {
            this.operationCategories = result
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
               this.fillTblExpenses(result)
            },
            error: () => { this.toastr.error("Ha ocurrido un error", "Error") }
         })
      }
   }

   onSearchExpense(e: any) {
      if (!e.target.value) {
         this.getExpenses()
      } else {
         this.callServiceSearchExpenses(e.target.value)
      }
   }

   callServiceSearchExpenses(search: string) {
      this.service.searchExpense(this.brandSelected.id, this.dateFilter.start, this.dateFilter.end, search).subscribe({
         next: (res: any) => {
            this.fillTblExpenses(res)
         },
         error: (e) => {
            this.toastr.error("Ha ocurrido un error", "Error")
         }
      })
   }

   fillTblExpenses(result: any) {
      if (Array.isArray(result)) {
         this.expensesList = result.map((r: any) => {
            let strDate = this.dates.getWeekDay(r.expenseDate)
            let date = this.dates.formatDate(r.expenseDate)
            return { ...r, weekDay: strDate, date: date }
         })

         this.fillFacturationChart(result)
         this.getCategories(result)
         this.dataSource = new MatTableDataSource(this.expensesList);
         this.dataSource.paginator = this.paginator;
      } else {
         this.toastr.error("Ha ocurrido un error")
      }
   }

   async fillFacturationChart(data: any[]) {
      let countYes = data.filter(r => r.billing == 'SI').length
      let countNot = data.filter(r => r.billing == 'NO').length
      this.facturationChartData = Charts.Donut(['SI', 'NO'], [countYes, countNot])
   }

   onChangeCategory(e: any) {
      this.billRegister.providerCategories = {}
      this.getServiceProviderCategory(e.value.id)
   }

   onCheckedBilling(e: any) {
      this.billRegister.selected = !this.billRegister.billing
   }

   saveExpense() {
      if (this.validData()) {
         this.billRegister.amount = Number(String(this.billRegister.amount).replace('$', ''))
         this.billRegister.billing = this.billRegister.selected ? 'SI' : 'NO'
         this.billRegister.branch.id = this.brandSelected.id
         this.billRegister.expenseDate = this.dates.formatDate(this.billRegister.date, 'yyyy-MM-DD')

         this.service.saveExpense(this.billRegister).subscribe({
            next: (res: any) => {
               if (res.acknowledge) {
                  this.toastr.success("El gasto se ha guardado correctamente", "Success")
                  this.modalRef?.hide()
                  this.resetModalData()
                  this.getExpenses()
               } else {
                  this.toastr.error("Ha ocurrido un error", "Error")
               }
            },
            error: (error) => {
               this.toastr.error("Ha ocurrido un error", "Error")
               console.error(error)
            }
         })
      } else {
         this.toastr.error("Favor de ingresar los campos requeridos")
      }

   }

   onDeleteExpense(item: any) {
      let resp = confirm(`¿Esta seguro de eliminar el gasto por la cantidad de $${item.amount}?`)
      if (resp) {
         this.service.deleteExpense(this.brandSelected.id, item.id).subscribe({
            next: (res: any) => {
               if (res.acknowledge) {
                  this.toastr.success("El gasto se ha eliminado correctamente", "Success")
                  this.getExpenses()
               } else {
                  this.toastr.error("Ha ocurrido un error", "Error")
               }
            },
            error: () => {
               this.toastr.error("Ha ocurrido un error", "Error")
            }
         })
      }
   }

   onEditExpense(item: any, template: TemplateRef<any>) {
      this.billRegister.id = item.id
      this.billRegister.foodCategories = item.foodCategories
      this.billRegister.providerCategories = item.providerCategories
      this.billRegister.operationType = item.operationType
      this.billRegister.billing = item.billing
      this.billRegister.selected = item.billing == 'SI'
      this.billRegister.amount = item.amount
      this.billRegister.expenseDate = item.expenseDate
      this.billRegister.date = this.dates.convertToDate(item.expenseDate)
      this.getServiceProviderCategory(item.foodCategories.id)
      this.openModal(template)
   }

   getServiceProviderCategory(categoryId: number) {
      this.service.getProviderByCategory(categoryId).subscribe({
         next: (res: any) => {
            if (Array.isArray(res) && res.length > 0) {
               this.providerCategories = res
            } else {
               this.toastr.error("No se encontraron proveedores", "Error")
            }
         },
         error: () => {
            this.toastr.error("Ha ocurrido un error", "Error")
         }
      })
   }

   async resetModalData() {
      this.billRegister = {
         id: null,
         foodCategories: {},
         providerCategories: {},
         operationType: {},
         amount: "$0.00",
         selected: true,
         billing: 'SI',
         branch: { id: 0 },
         name: "",
         description: "",
         createdAt: new Date(),
         expenseDate: new Date(),
         date: new Date(),
         maxDate: new Date()
      }
   }

   validData() {
      let propertiesToValid = ['foodCategories', 'providerCategories', 'operationType', 'amount']
      let isValid = false

      for (let key of propertiesToValid) {
         let type = typeof this.billRegister[key]
         if (type == 'object') {
            isValid = Object.keys(this.billRegister[key]).length == 0 ? false : true
            if (!isValid) break
         } else if (type == 'string' && key == 'amount' && this.billRegister[key] == '$0.00') {
            isValid = false
            break
         }
      }
      return isValid
   }

   async getCategories(expenses: any) {
      let totalSum = expenses.reduce((total: any, value: any) => total + value.amount, 0)
      this.sumaGastosTotales = totalSum.toFixed(2)
      let categoriesName: any = []
      let amountCategories: any = []
      let categories = this.foodCategories.map((category: any) => {
         let expCategories = expenses.filter((e: any) => e.foodCategories.id == category.id)
         let sum = expCategories.reduce((total: any, value: any) => total + value.amount, 0)
         let percent = (sum / totalSum) * 100
         categoriesName.push(category.name)
         amountCategories.push(sum)
         return { id: category.id, name: category.name, amount: sum.toFixed(2), percent: percent.toFixed(2) }
      })
      this.barChartData.labels = categoriesName
      this.barChartData.datasets[0].data = amountCategories
      this.chart?.update()
   }

   /*
   public chartHovered({ event, active }: { event?: ChartEvent; active?: object[] }): void {
      console.log(event, active);
   }

   public chartClicked({ event, active }: { event?: ChartEvent; active?: object[] }): void {
      console.log(event, active);
   } */



}

import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { MainService } from 'src/app/main/main.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { configDropdown } from 'src/app/util/util';
import { ExpenseService } from './expenses.service';
import { Charts } from 'src/app/util/Charts';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgxCurrencyDirective } from 'ngx-currency/public-api';
import { Dates } from 'src/app/util/Dates';
import { ActivatedRoute } from '@angular/router';



@Component({
   selector: 'app-expenses',
   templateUrl: './expenses.component.html',
   styleUrls: ['./expenses.component.scss']
})
export class BillsComponent implements OnInit {
   brandSelected: any
   expensesList: any = []
   private dates: Dates = new Dates()

   modalRef?: BsModalRef;
   readonly config = configDropdown

   billRegister: any = {}

   foodCategories: any = []
   providerCategories: any = []
   operationCategories: any = []

   facturationChartData: any

   dataSource!: MatTableDataSource<any>;
   columnas: string[] = ['Fecha', 'Dia', 'Categoria', 'Proveedor', 'Operación', 'Monto', 'Facturación', 'Acciones'];
   @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

   constructor(private service: ExpenseService, private mainService: MainService,
      private modalService: BsModalService, private toastr: ToastrService, private activeRouter: ActivatedRoute) {
      this.activeRouter.queryParams.subscribe((params: any) => {
         mainService.setPageName(params.nombre)
      })

      this.resetModalData()
      this.getCatalogs()

      mainService.$filterMonth.subscribe((month: any) => {
         if (month) {
            if (mainService.getPageName() === 'Gastos') {
               console.log("mes seleccionado", month)
            }
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
            this.foodCategories = result //result.map((s: any) => { return { id: s.id, description: s.name } })
         }
      })

      this.mainService.$operationCategories.subscribe((result: any) => {
         if (result) {
            this.operationCategories = result//result.map((s: any) => { return { id: s.id, description: s.name } })
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
               if (Array.isArray(result)) {
                  this.expensesList = result.map((r: any) => {
                     let strDate = this.dates.getWeekDay(r.expenseDate)
                     let date = this.dates.formatDate(r.expenseDate)
                     return { ...r, weekDay: strDate, date: date }
                  })

                  this.fillFacturationChart(result)
                  this.dataSource = new MatTableDataSource(this.expensesList); // Inicializa la propiedad en el constructor
                  this.dataSource.paginator = this.paginator;
               }
            },
            error: () => { this.toastr.error("Ha ocurrido un error", "Error") }
         })
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
      this.billRegister.amount = Number(String(this.billRegister.amount).replace('$', ''))
      this.billRegister.billing = this.billRegister.selected ? 'SI' : 'NO'
      this.billRegister.branch.id = this.brandSelected.id
      this.billRegister.expenseDate = this.dates.convertToDate(this.billRegister.date)

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
         amount: 0,
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

   }

}

import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { MainService } from 'src/app/main/main.service';
import { Dates } from 'src/app/util/Dates';
import { OperationType, Pages, PaymentMethod, TypeModules, addPlatafformInData, firstUpperCase, groupArrayByKey, isNumber, sortByKey, totalSalesByDelivery } from 'src/app/util/util';
import { ExpenseService } from '../expenses/expenses.service';
import { SalesService } from '../sales/sales-service.service';
import { ResultService } from '../results/result.service';
import { Expense } from '@expenses/Expense';
import { Sale } from '@sales/Sale';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.scss']
})
export class CashFlowComponent implements OnInit {
  dates = new Dates()

  months: Array<any> = this.dates.getMonths()
  foodCategories: Array<any> = []
  dataTable: Array<any> = []

  private brandSelected: any
  private expenses: Array<any> = []

  private sales: Array<any> = []

  private cuentasPorCobrar: Array<any> = []
  readonly paymentMethod = PaymentMethod
  private totalIncomeCash: Array<any> = []
  private totalIncomeCards: Array<any> = []

  public cashData: any = {name: 'Efectivo', data: []}
  public cardData: any = {name: 'Tarjeta', data: []}

  startEndFilter: any

  constructor(private mainService: MainService,
    private loading: LoadingService,
    private toast: ToastrService,
    private expenseService: ExpenseService,
    private salesService: SalesService,
    private resultService: ResultService) {

    mainService.setPageName(Pages.CASH)
    this.months.push({ id: 0, name: 'Total' })

  }

  ngOnInit(): void {

    this.brandSelected = JSON.parse(this.mainService.currentBranch)

    let startEndFilter = this.dates.getStartAndEndYear(this.dates.getCurrentYear())
    this.startEndFilter = startEndFilter
    this.callServiceSearchExpenses(startEndFilter.start, startEndFilter.end)
    this.getReportSalesByDateRange(startEndFilter.start, startEndFilter.end)
    this.getCuentasPorCobrar(startEndFilter.start, startEndFilter.end)
    this.getServiceIncomeForModule(startEndFilter)

    this.mainService.$foodCategories.subscribe((r: any) => {
      if (Array.isArray(r)) {
        this.foodCategories = r
      }
    })
  }

 

  /**:::::::::::::::::::::: GASTOS ::::::::::::::::::::*/

  /**
   * Servicio para obtener los gastos
   * @param start fecha de inicio
   * @param end fecha final
   * @param search texto filtro
   */
  async callServiceSearchExpenses(start: string, end: string, search: string = "") {
    this.loading.start()
    new Expense(this.expenseService, this.brandSelected).callServiceSearchExpenses(start, end, search).then((res: any) => {
      this.expenses = res.map((r: any) => {
        return { ...r, shortMonth: firstUpperCase(r.shortMonth.replace(".", "").toLowerCase()) }
      })
      this.loading.stop()
    }).catch((e: any) => {
      this.loading.stop()
      this.toast.error(e)
    })
    /*this.expenseService.searchExpense(this.brandSelected.id, start, end, search).subscribe({
      next: (res: any) => {
        console.log("gastos",res)
        if (Array.isArray(res)) {
          res = res.map((e: any) => {
            let monthNumber = this.dates.getMonthNumber(e.expenseDate)
            let month = this.dates.getMonthName(e.expenseDate, 'MMMM')
            let shortMonth = this.dates.getMonthName(e.expenseDate, 'MMM')
            let categoryCode = e.foodCategories.code

            return { ...e, month, monthNumber, shortMonth: shortMonth.replace(".", "").toUpperCase(), categoryCode }
          })
        }
        this.expenses = res
      },
      error: (e) => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error", "Error")
      },
      complete: () => {
        this.loading.stop()
      }
    })*/
  }

  /**
   * Obtiene los gastos en efectivo filtrados por mes
   * @param month month: mes a filtrar
   * @returns 
   */
  getExpensesCash(month: string): number {
    return this.expenses.filter((e: any) => e.shortMonth == month).filter((e: any) => e.operationType.code == OperationType.CASH || e.operationType.code == OperationType.BOX)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  /**
   * Obtiene los gastos con transferencia filtrados por mes
   * @param month month: mes a filtrar
   * @returns 
   */
  getExpensesTransfer(month: string): number {
    return this.expenses.filter((e: any) => e.shortMonth == month).filter((e: any) => e.operationType.code == OperationType.TRANSFER)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  /** ::::::::::::::::  VENTAS :::::::::::::::::*/

  /**
 * Servicio para obtener las ventas 
 * @param startDate fecha de inicio
 * @param endDate  fecha fin
 */
  async getReportSalesByDateRange(startDate: string, endDate: string) {

    this.loading.start()

    this.sales = []
    new Sale(this.salesService).salesService(startDate, endDate, this.brandSelected.id).then((res: any) => {
      this.sales = res.sales.map((r: any) => {
        return { ...r, shortMonth: firstUpperCase(r.shortMonth.replace(".", "").toLowerCase()) }
      })
      this.loading.stop()
    }).catch((e: any) => {
      this.loading.stop()
      this.toast.error(e)
    })
    /* this.salesService.getReportSalesByDateRange(this.brandSelected.id, startDate, endDate).subscribe({
       next: (data: any) => {
         if (Array.isArray(data)) {
           let sales = data.map((s: any) => {
 
             let month = this.dates.getMonthName(s.dateSale, 'MMMM')
             let shortMonth = this.dates.getMonthName(s.dateSale, 'MMM')
             let monthNumber = this.dates.getMonthNumber(s.dateSale)
 
             let apps = addPlatafformInData(s)
 
             return {
               ...s, month: month.replace(".", ""), monthNumber, shortMonth: shortMonth.replace(".", "").toUpperCase(), apps
             }
           })
           this.sales = sales
         }
       },
       error: (e) => {
         this.loading.stop()
         this.toast.error("Ocurrio un error al intentar obtener las ventas")
       },
       complete: () => {
         this.loading.stop()
       }
     }) */
  }

  /**
   * Obtiene el total de ventas  en efectivo filtrados por mes
   * @param month
   * @returns 
   */
  getTotalCashByMonth(month: string): number {
    //return this.sales.filter((s: any) => s.shortMonth == month).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    let monthData = this.totalIncomeCash.find((s: any) => s.shortMonth == month)//.reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    return monthData ? monthData.income : 0
  } 

  /**
   * Obtiene el total de ventas pagadas con transferencia filtrados por mes
   * @param month
   * @returns 
   */
  getTotalCardByMonth(month: string): number {
    //return this.sales.filter((s: any) => s.shortMonth == month && s.apps.parrot.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.income), 0)
    let monthData = this.totalIncomeCards.find((s: any) => s.shortMonth == month)//.reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    return monthData ? monthData.income : 0
  }

  /**
   * Obtiene el total de ventas por aplicacion filtrados por mes
   * @param month 
   * @returns 
   */
  getSalesAppsByMonth(month: string): number {
    let totalApps = 0
    let salesMonth = this.sales.filter((s: any) => s.shortMonth == month)
    totalApps = totalApps + salesMonth.filter((s: any) => s.apps.uber.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    totalApps = totalApps + salesMonth.filter((s: any) => s.apps.didi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    totalApps = totalApps + salesMonth.filter((s: any) => s.apps.rappi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
    return totalApps
  }

  /** ::::::::::::::::::: CUENTAS POR COBRAR :::::::::::::::::::::::::::*/
  /**
   * Servicio para obtener las cuentas por cobrar
   * @param startDate fecha inicio
   * @param endDate fecha fin
   */
  async getCuentasPorCobrar(startDate: string, endDate: string) {
    this.loading.start()
    this.resultService.getCuentasPorCobrar(this.brandSelected.id, startDate, endDate).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.cuentasPorCobrar = sortByKey(res, "id").map((c: any) => {//2024-02-17T05:07:55.089Z
            let shortMonth = this.dates.formatDate(c.createdAt, 'MMM', 'YYYY-MM-DDTHH:mm:SS.sssZ')
            return { ...c, shortMonth: firstUpperCase(shortMonth).replace(".", "") }
          })
        }
      },
      error: (e) => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error", "Error")
      },
      complete: () => {
        this.loading.stop()
      }
    })
  }

  /**
   *  Obtiene las cuentas por cobrar pagadas en efectivo filtrados por mes
   * @param month month:mes a filtrar
   * @returns 
   */
  getCuentaPagadaCash(month: string): number {
    return this.cuentasPorCobrar.filter((c: any) => c.shortMonth == month).filter((c: any) => c.isPay && (c.operationType.code == OperationType.CASH || c.operationType.code == OperationType.BOX))
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  /**
   *  Obtiene las cuentas por cobrar pagadas con transferencia filtrados por mes
   * @param month month:mes a filtrar
   * @returns 
   */
  getCuentaPagadaTransfer(month: string): number {
    return this.cuentasPorCobrar.filter((c: any) => c.shortMonth == month).filter((c: any) => c.isPay && c.operationType.code == OperationType.TRANSFER)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }


  /** ::::::::::::::::::: TARJETAS PRINCIPALES :::::::::::::: */

  /**
   * Regresa el total de las Ventas en Efectivo del año
   */
  get totalCashIndicatorCard(): number {
    let total = this.cashData.data.find((s: any) => s.month == 'Total')?.total!
    return total ? total : 0
  }

  /**
   * Regresa el total de las Vents por tarjeta del año
   */
  get totalCardIndicatorCard(): number {
    let total = this.cardData.data.find((s: any) => s.month == 'Total')?.total!
    return total ? total : 0
  }

  /**
   * Regresa el total de las cuentas por cobrar del año
   */
  get totalReceivableIndicatorCard(): number {
    let total = this.receivableData.data.find(s => s.month == 'Total')?.total!
    return total ? total : 0
  }

  /**
   * Regresa el total de la suma de las ventas(Efectivo, Tarjeta, Por Cobrar)
   */
  get totalIndicatorCard(): number {
    let total = this.totalData.data.find(s => s.month == 'Total')?.total!
    return total ? total : 0
  }

  /**
   * Regresa la suma del GAP del año
   */
  get totalGAPIndicatorCard(): number {
    let total = this.gapData.data.find(s => s.month == 'Total')?.total!
    return total ? total : 0
  }

  /**
   * Obtiene la suma total de las ventas
   */
  get salesCurrentYear() {
    let total = totalSalesByDelivery(this.sales)
    let year = this.dates.getCurrentYear()
    return { year, total }
  }

  /**
   * Regresa el encabezado de la tabla
   */
  get headerData() {
    let months = this.dates.getMonths()
    months.push({ id: 0, name: 'Total' })
    return months
  }

  /**
   * Obtiene las ventas agrupados por mes
   */
  getSalesByMonth() {
    let byMonth = groupArrayByKey(this.sales, 'shortMonth')
    let salesMonth: Array<any> = []
    this.dates.getMonths().map((m: any) => {
      let total = Array.isArray(byMonth[m.name]) ? totalSalesByDelivery(byMonth[m.name]) : 0
      salesMonth.push({ month: m.name, total: Number(total.toFixed(2)) })
    })

    salesMonth.push({ month: 'Total', total: this.salesCurrentYear.total })
    return salesMonth
  }

  get salesData() {
    return { name: 'Ventas', data: this.getSalesByMonth() }
  }

  /**
   * Otbiene las cuentas por cobrar por mes
   * @returns 
   */
  getAccountsReceivableByMonth() {
    let cuentasPorCobrar = groupArrayByKey(this.cuentasPorCobrar.filter((c: any) => !c.isPay), "shortMonth")

    let saldoCobrarMes = this.dates.getMonths().map(m => {
      let filterMonth = cuentasPorCobrar[m.name]
      let total = 0
      if (Array.isArray(filterMonth)) {
        total = filterMonth.reduce((total: number, obj: any) => total + obj.amount, 0)
      }
      return { month: m.name, total: total }
    })
    let totalYear = saldoCobrarMes.reduce((total: number, obj: any) => total + obj.total, 0)
    saldoCobrarMes.push({ month: 'Total', total: totalYear })
    return saldoCobrarMes
  }

  get accountsReceivableData() {
    return { name: 'Saldo Por Cobrar', data: this.getAccountsReceivableByMonth() }
  }

  get totalAccountsReceivableData() {
    return { name: 'Total Cuentas Por Cobrar', data: this.getAccountsReceivableByMonth() }
  }

  /**
   * Obtiene el total Disponible por mes
   * @returns 
   */
  get totalAvailableData() {
    return { name: 'Total Disponible', data: this.getSalesByMonth() }
  }

  /**
   *  Obtiene los gastos agrupados por categoria y mes
   */
  get expensesByCategoryData() {
    let groupedByCategory = groupArrayByKey(this.expenses, "categoryCode")
    let dataByCategory: Array<any> = []
    Object.keys(groupedByCategory).map((c: any) => {
      let categoryExpByMonth = this.getExpensesByMonth(groupedByCategory[c])

      let totalYearCategory = categoryExpByMonth.reduce((total: number, obj: any) => total + obj.total, 0)
      categoryExpByMonth.push({ month: 'Total', total: Number(totalYearCategory.toFixed(2)) })
      dataByCategory.push({ name: groupedByCategory[c][0].foodCategories.name, data: categoryExpByMonth })
    })

    return dataByCategory
  }

  /**
   * Obtiene el total de los gastos por mes
   * @param data data: Gastos a agrupar por mes
   * @returns 
   */
  getExpensesByMonth(data: Array<any>) {
    let categoryByMonth = groupArrayByKey(data, "shortMonth")

    let categoryExpByMonth: Array<any> = []
    this.dates.getMonths().map((m: any) => {

      let groupedByMonth = categoryByMonth[m.name]

      let total = 0
      if (Array.isArray(groupedByMonth)) {
        total = groupedByMonth.reduce((total: number, obj: any) => total + obj.amount, 0)
      }
      categoryExpByMonth.push({ month: m.name, total })
    })

    return categoryExpByMonth
  }

  /**
   * Obtiene la suma total de los gastos por mes
   */
  get totalExpensesByMonth() {
    let expesesMonth = this.getExpensesByMonth(this.expenses)
    let totalYear = expesesMonth.reduce((total: number, obj: any) => total + obj.total, 0)
    expesesMonth.push({ month: 'Total', total: Number(totalYear.toFixed(2)) })
    return { name: 'Total Gastos', data: expesesMonth }
  }


  /**
   * Calcula el total Disponible (Fin mes)
   * @returns 
   */
  getAvailableByMonthEndMonthRow() {
    let sales = this.getSalesByMonth()
    let expenses = this.getExpensesByMonth(this.expenses)

    let availableMonths = this.dates.getMonths().map(m => {
      let saleMonth = sales.find((s: any) => m.name == s.month)
      let expMonth = expenses.find((e: any) => m.name == e.month)
      let total = 0
      if (saleMonth && expMonth) {
        total = saleMonth.total - expMonth.total
      }
      return { month: m.name, total: total }
    })

    let totalYear = availableMonths.reduce((total: number, obj: any) => total + obj.total, 0)
    availableMonths.push({ month: 'Total', total: totalYear })

    return availableMonths
  }

  /**
   * Regresa los datos para la fila 'Total Disponible (Fin Mes)' de la tabla Cash flow
   */
  get totalAvailableEndMonthData() {
    return { name: 'Total Disponible (Fin Mes)', data: this.getAvailableByMonthEndMonthRow() }
  }

  /**
   * Suma las Ventas realizadas en Efectivo
   * @returns Un listado del total de las ventas en efectivo por mes
   */
  getTotalCashRow() {
    let totalCash = this.dates.getMonths().map(m => {
      let total = this.getTotalCashByMonth(m.name);
      return { month: m.name, total, mFormat: m.mFormat }
    })
    let totalYear = totalCash.reduce((total: number, obj: any) => total + obj.total, 0)
    totalCash.push({ month: 'Total', total: totalYear, mFormat: 'NONE'  })
    this.cashData.data = totalCash
  }

  /**
   * Regresa los datos para la fila 'Efectivo' de la tabla Cash flow
   */
  /*getCashData(): any {
    return { name: 'Efectivo', data: this.cashData }
  }*/

  /**
   * Obtiene los calculos para las ventas con 'Tarjeta'
   * @returns Una lista con el total de las ventas por mes
   */
  getTotalCardRow() {
    let totalCard = this.dates.getMonths().map(m => {
      let total = this.getTotalCardByMonth(m.name)
      /*let totalApps = this.getSalesAppsByMonth(m.name)
      let totalCuentaTransfer = this.getCuentaPagadaTransfer(m.name)

      let total = (totalCard + totalApps + totalCuentaTransfer) - this.getExpensesTransfer(m.name)*/
      return { month: m.name, total: total, mFormat: m.mFormat }
    })

    let totalYear = totalCard.reduce((total: number, obj: any) => total + obj.total, 0)
    totalCard.push({ month: 'Total', total: totalYear, mFormat: 'NONE' })
    //return totalCard
    this.cardData.data = totalCard
  }

  /**
   *  Obtiene los datos para la fila 'Tarjeta' de la tabla cash flow
   */
  /*getCardData(): any {
    return { name: 'Tarjeta', data: this.cardData }
  }*/

  /**
   * Obtiene los datos para la fila 'Por Cobrar' de la tabla cash flow
   */
  get receivableData() {
    return { name: 'Por Cobrar', data: this.getAccountsReceivableByMonth() }
  }

  /**
   * Suma de las ventas 'Efectivo', 'Tarjeta' y 'Por Cobrar'
   * @returns una lista con el total por mes
   */
  getTotalRow() {
    let totalCashM = this.cashData.data//this.getTotalCashRow()
    let totalCardM = this.cardData.data//this.getTotalCardRow()
    let totalPorCobrarM = this.getAccountsReceivableByMonth()

    let totalList = this.headerData.map(m => {
      let totalCash = totalCashM.find((c: any) => c.month == m.name)
      let totalCard = totalCardM.find((c: any) => c.month == m.name)
      let totalPorCobrar = totalPorCobrarM.find((c: any) => c.month == m.name)

      let total = 0
      if (totalCash && totalCard && totalPorCobrar) {
        total = (totalCash.total + totalCard.total + totalPorCobrar.total)
      }
      return { month: m.name, total }
    })

    return totalList
  }

  /**
   * Regresa los datos para la fila 'Total' de la tabla Cash flow
   */
  get totalData() {
    return { name: 'Total', data: this.getTotalRow() }
  }

  /**
   * Calcula el GAP con base a las Ventas totales y los Gastos
   * @returns un listado del total por mes
   */
  getGapRow() {
    let availableEndMonth = this.getAvailableByMonthEndMonthRow()
    let totalData = this.getTotalRow()

    return this.headerData.map(m => {
      let available = availableEndMonth.find((a: any) => a.month == m.name)
      let totalD = totalData.find((t: any) => t.month == m.name)
      let total = 0
      if (available && totalD) {
        total = (totalD.total - available.total)
      }
      return { month: m.name, total }
    })
  }

  /**
   * Regresa los datos para la fila 'GAP' de la tabla Cash flow
   */
  get gapData() {
    return { name: 'GAP', data: this.getGapRow() }
  }

  onChangeTotalIncome(total: any, method: string, month: any) {
    if (month.mFormat != 'NONE') {

      let data = total.replace("$", "").replace(",","")
      if(isNumber(data)) {
        let totalIncome = Number(data)
        if(totalIncome != 0) {
          month.total = totalIncome
          this.updateIncomeForModule(method, totalIncome, month.mFormat)
        }
        
      } else {
        this.toast.error("No es una cantidad valida")
      }
     
    }
  }

  /**
   * Llama servicios para obtener los totales de efectivo y tarjeta por mes
   * @param startEndFilter rango de fechas para filtrado
   */
  private async getServiceIncomeForModule(startEndFilter: any){
    this.getIncomeForModule(startEndFilter.start, startEndFilter.end, this.paymentMethod.CASH).then((res: any) => {
      this.totalIncomeCash = res
      this.getTotalCashRow()
    }).catch((e) => {
      this.toast.error(e)
    })
    this.getIncomeForModule(startEndFilter.start, startEndFilter.end, this.paymentMethod.CARD).then((res: any) => {
      this.totalIncomeCards = res
      this.getTotalCardRow()
    }).catch(e => {
      this.toast.error(e)
    })
  }

  /**
   * Actualiza los totales de los modules efectivo y tarjeta
   * @param typePayment 
   * @param totalIncome 
   * @param date 
   */
  async updateIncomeForModule(typePayment: string, totalIncome: number, date: string) {
    let data = {
      id: null,
      dateSale: date,
      income: totalIncome,
      branchId: this.brandSelected.id,
      module: TypeModules.CASH_FLOW,
      paymentMethod: typePayment
    }
    this.resultService.saveIncomeForModule(data).subscribe({
      next: (res: any) => {
        if (res) {
          this.getServiceIncomeForModule(this.startEndFilter)
        }  else {
          this.toast.error("Ha ocurrido un error")

        }
      },
      error: () => {
        this.toast.error("Ocurrio un error al actualizar el total")
      }
    })
  }

  async getIncomeForModule(startDate: string, endDate: string, paymentMethod: string) {
    //this.loading.start()
    return new Promise((resolve, reject) => {
      this.resultService.getIncomeForModule(this.brandSelected.id, startDate, endDate).subscribe({
        next: (data: any) => {
          //this.loading.stop()
          if (Array.isArray(data)) {
            let totalIncome = data.filter((s: any) => s.module == TypeModules.CASH_FLOW && s.paymentMethod == paymentMethod)
            totalIncome = totalIncome.map((s: any) => {
              let date = this.dates.formatDate(s.dateSale, "DD-MM-YYYY", "MM-YYYY")
              let shortMonth = firstUpperCase(this.dates.getMonthName(date, "MMM").toLocaleLowerCase()).replace(".","")
              return {...s, date, shortMonth}
            })
            resolve(totalIncome)
          } else {
            reject("Ocurrio un error")
          }
        },
        error: () => {
         reject("Ocurrio un error al obtener los totales de efectivo y tarjeta")
        }
      })
    })

  }
}

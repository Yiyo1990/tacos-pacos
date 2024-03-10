import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { MainService } from 'src/app/main/main.service';
import { Dates } from 'src/app/util/Dates';
import { OperationType, Pages, addPlatafformInData, firstUpperCase, groupArrayByKey, sortByKey, totalSalesByDelivery } from 'src/app/util/util';
import { ExpenseService } from '../expenses/expenses.service';
import { SalesService } from '../sales/sales-service.service';
import { ResultService } from '../results/result.service';

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
    this.callServiceSearchExpenses(startEndFilter.start, startEndFilter.end)
    this.getReportSalesByDateRange(startEndFilter.start, startEndFilter.end)
    this.getCuentasPorCobrar(startEndFilter.start, startEndFilter.end)

    this.mainService.$foodCategories.subscribe((r: any) => {
      if (Array.isArray(r)) {
        this.foodCategories = r
      }
    })
  }

  /** GASTOS */

  /**
   * Servicio para obtener los gastos
   * @param start fecha de inicio
   * @param end fecha final
   * @param search texto filtro
   */
  async callServiceSearchExpenses(start: string, end: string, search: string = "") {
    this.loading.start()
    this.expenseService.searchExpense(this.brandSelected.id, start, end, search).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          res = res.map((e: any) => {
            let monthNumber = this.dates.getMonthNumber(e.expenseDate)
            let month = this.dates.getMonthName(e.expenseDate, 'MMMM')
            let shortMonth = this.dates.getMonthName(e.expenseDate, 'MMM')
            let categoryCode = e.foodCategories.code

            return { ...e, month, monthNumber, shortMonth: firstUpperCase(shortMonth).replace(".", ""), categoryCode }
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
    })
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

  /** VENTAS */

  /**
 * Servicio para obtener las ventas 
 * @param startDate fecha de inicio
 * @param endDate  fecha fin
 */
  async getReportSalesByDateRange(startDate: string, endDate: string) {
    this.loading.start()

    this.sales = []
    this.salesService.getReportSalesByDateRange(this.brandSelected.id, startDate, endDate).subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          let sales = data.map((s: any) => {

            let month = this.dates.getMonthName(s.dateSale, 'MMMM')
            let shortMonth = this.dates.getMonthName(s.dateSale, 'MMM')
            let monthNumber = this.dates.getMonthNumber(s.dateSale)

            let apps = addPlatafformInData(s)

            return {
              ...s, month, monthNumber, shortMonth: firstUpperCase(shortMonth).replace(".", ""), apps
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
    })
  }

  /**
   * Obtiene el total de ventas  en efectivo filtrados por mes
   * @param month
   * @returns 
   */
  getSalesCashByMonth(month: string): number {
    return this.sales.filter((s: any) => s.shortMonth == month).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
  }

  /**
   * Obtiene el total de ventas pagadas con transferencia filtrados por mes
   * @param month
   * @returns 
   */
  getSalesTransferByMonth(month: string): number {
    return this.sales.filter((s: any) => s.shortMonth == month && s.apps.parrot.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.income), 0)
  }

  /**
   * Obtiene el total de ventas por aplicacion filtrados por mes
   * @param month 
   * @returns 
   */
  getSalesAppsByMonth(month: string): number{
    let totalApps = 0
    let salesMonth = this.sales.filter((s: any) => s.shortMonth == month)
    totalApps = totalApps + salesMonth.filter((s: any) => s.apps.uber.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    totalApps = totalApps + salesMonth.filter((s: any) => s.apps.didi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    totalApps = totalApps + salesMonth.filter((s: any) => s.apps.rappi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
    return totalApps
  }

  /** CUENTAS POR COBRAR */
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
      let saleMonth = byMonth[m.name]
      let total = 0
      if (Array.isArray(saleMonth)) {
        total = saleMonth.reduce((total: number, obj: any) => total + obj.totalSale, 0)
      }
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
   * Obtiene el total disponible (Fin Mes)
   */

  getAvailableByMonthEndMonth() {
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

  get totalAvailableEndMonthData() {
    return { name: 'Total Disponible (Fin Mes)', data: this.getAvailableByMonthEndMonth() }
  }

  /**
  * Obtiene el total de Efectivo por mes
  */
  getTotalCash() {
    let totalCash = this.dates.getMonths().map(m => {
      let salesCash = this.getSalesCashByMonth(m.name);
      let expensesCash = this.getExpensesCash(m.name);
      let cuentasPagadas = this.getCuentaPagadaCash(m.name);
      let total = ((salesCash + cuentasPagadas) - expensesCash);
      return { month: m.name, total }
    })
    let totalYear = totalCash.reduce((total: number, obj: any) => total + obj.total, 0)
    totalCash.push({ month: 'Total', total: totalYear })

    return totalCash
  }

  get cashData() {
    return { name: 'Efectivo', data: this.getTotalCash() }
  }

  /**
  * Obtiene el total de Tarjeta por mes
  */
  getTotalCard() {
    let totalCard =  this.dates.getMonths().map(m => {
      let totalCard = this.getSalesTransferByMonth(m.name)
      let totalApps = this.getSalesAppsByMonth(m.name)
      let totalCuentaTransfer = this.getCuentaPagadaTransfer(m.name)
      
      let total = (totalCard + totalApps + totalCuentaTransfer) - this.getSalesTransferByMonth(m.name)
      return { month: m.name, total: total }
    })

    let totalYear = totalCard.reduce((total: number, obj: any) => total + obj.total, 0)
    totalCard.push({month: 'Total', total: totalYear})
    return totalCard
  }

  get cardData() {
    return { name: 'Tarjeta', data: this.getTotalCard() }
  }

  /**
   * Obtiene el total Por Cobrar agrupado por mes
   */
  get receivableData() {
    return { name: 'Por Cobrar', data: this.getAccountsReceivableByMonth() }
  }

  /**
   * Obtiene el Total agrupado por mes
   */
  getTotal() {
    let totalCashM = this.getTotalCash()
    let totalCardM = this.getTotalCard()
    let totalPorCobrarM = this.getAccountsReceivableByMonth()

    let totalList =  this.headerData.map(m => {
      let totalCash = totalCashM.find((c: any) => c.month == m.name)
      let totalCard = totalCardM.find((c: any) => c.month == m.name)
      let totalPorCobrar = totalPorCobrarM.find((c: any) => c.month == m.name)
      
      let total = 0
      if(totalCash && totalCard && totalPorCobrar) {
        total = (totalCash.total + totalCard.total + totalPorCobrar.total)
      }
      return { month: m.name, total }
    })

    return totalList
  }

  get totalData() {
    return { name: 'Total', data: this.getTotal() }
  }

  /**
   * Obtiene el GAP agrupado por mes
   */
  getGap() {

    let availableEndMonth = this.getAvailableByMonthEndMonth()
    let totalData = this.getTotal()

    return this.headerData.map(m => {
      let available = availableEndMonth.find((a: any) => a.month == m.name)
      let totalD = totalData.find((t: any) => t.month == m.name)
      let total = 0
      if(available && totalD) {
        total = (totalD.total - available.total)
      }
      return { month: m.name, total }
    })
  }

  get gapData() {
    return { name: 'GAP', data: this.getGap() }
  }
}

/**
 * Total dsponible : Se duplica con total de ventas
 * Total Diponible Fin mes:  Total Ventas/Diponible - Total Gastos
 * 
 * 10,000 
 */
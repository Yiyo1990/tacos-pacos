import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { MainService } from 'src/app/main/main.service';
import { SalesService } from '@sales/sales-service.service';
import { BalanceType, OperationType, Pages, ReportChannel, barChartOptions, firstUpperCase, fixedData, groupArrayByKey, sortByKey } from '@util/util';
import { Dates } from '@util/Dates';
import { ExpenseService } from '../expenses/expenses.service';
import { Charts } from '@util/Charts';
import { ResultService } from '../results/result.service';
import { Sale } from '@sales/Sale';
import { Expense } from '@expenses/Expense';

//import { default as Annotation } from 'chartjs-plugin-annotation';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

  readonly balanceType = BalanceType

  brandSelected: any
  dates = new Dates()
  barChartDataBalance: ChartData<'bar'> = {
    labels: [],
    datasets: []
  }
  barChartDataDaily: ChartData<'bar'> = {
    labels: [],
    datasets: []
  }
  barChartOptions: ChartOptions = barChartOptions
  readonly chartColors = Charts.chartColors

  /** SALES */
  sales: Array<any> = []
  isBtnParrotActive: number = 2
  private typeFilterAppBarChart = 1
  ticketsTargetList: Array<any> = []

  /** EXPENSES */
  expenses: Array<any> = []
  foodCategories: any = []
  foodCategorySelected: any = 0
  foodSupplier: any[] = []
  typeFilterExpenses: string = 'ALL'

  /** CUENTAS POR COBRAR */
  cuentasPorCobrar: Array<any> = []


  constructor(private mainService: MainService,
    private activeRouter: ActivatedRoute,
    private loading: LoadingService,
    private toast: ToastrService,
    private salesService: SalesService,
    private expenseService: ExpenseService,
    private resultService: ResultService) {

    mainService.setPageName(Pages.MAIN)
  }

  ngOnInit(): void {
    this.mainService.$brandSelected.subscribe((result: any) => {
      if (result) {
        this.brandSelected = JSON.parse(result)
        this.getFoodCategories()
        let startEndFilter = this.dates.getStartAndEndYear(this.dates.getCurrentYear())
        this.getReportSalesByDateRange(startEndFilter.start, startEndFilter.end)
        this.callServiceSearchExpenses(startEndFilter.start, startEndFilter.end)
        this.serviceTicketTarget(startEndFilter.start, startEndFilter.end)
        this.getCuentasPorCobrar(startEndFilter.start, startEndFilter.end)
      }
    })
  }

  onCheckedEvent(data: any) {
    if (!data.target) {
      let filter = this.barChartDataBalance.datasets.filter((d: any) => d.label != data.id)
      this.barChartDataBalance.datasets = filter
      this.updateCharts()
    }else {
        this.fillBarChartBalance(data.id)
    }
  }


  fillBarChartBalance(filter: string = 'ALL') {
    let chartDataProfit: Array<number> = []
    let chartDataSales: Array<number> = []
    let chartDataExpenses: Array<number> = []
    let dataSales = this.salesDataChart
    let dataExpenses = this.expensesDataChart
    //this.barChartDataBalance.datasets = []
    this.barChartDataBalance.labels = []

    dataSales.map((s: any) => {
      this.barChartDataBalance.labels?.push(s.month)
      let expense = dataExpenses.find((e: any) => e.month == s.month)
      let totalProfit = expense ? (s.total - expense.total) : s.total
      chartDataProfit.push(Number(totalProfit.toFixed(2)))
      chartDataSales.push(s.total)
      chartDataExpenses.push(expense ? expense.total : 0)
    })
    let existV = this.barChartDataBalance.datasets.find(s => s.label == this.balanceType.VENTAS)
    let existG = this.barChartDataBalance.datasets.find(s => s.label == this.balanceType.GASTOS)
    let existP = this.barChartDataBalance.datasets.find(s => s.label == this.balanceType.PROFIT)

    this.barChartDataBalance.datasets = []
    
    if (filter == this.balanceType.VENTAS || filter == 'ALL' || existV) {
      this.barChartDataBalance.datasets.push({ data: chartDataSales, label: this.balanceType.VENTAS, backgroundColor: this.chartColors.ventas })
    }

    if (filter == this.balanceType.GASTOS || filter == 'ALL' || existG) {
      this.barChartDataBalance.datasets.push({ data: chartDataExpenses, label: this.balanceType.GASTOS, backgroundColor: this.chartColors.gastos })
    }

    if (filter == this.balanceType.PROFIT || filter == 'ALL' || existP) {
      this.barChartDataBalance.datasets.push({ data: chartDataProfit, label: this.balanceType.PROFIT, backgroundColor: this.chartColors.profit })
    }

    this.updateCharts()
  }

  /**
   * Obtiene la cantidad maxima ingresada en la grafica anual
   */
  get maxNumber() {
    let maxNumber = 0
    this.barChartDataBalance.datasets.map(s => {
      s.data.map(s => {
        if (typeof s == 'number') {
          maxNumber = s > maxNumber ? s : maxNumber
        }
      })
    })

    return maxNumber == 0 ? 19.99 : Math.round(maxNumber)
  }

  /**
   * Obtiene el calculo para la división del tamaño width igualitaria 
   * de cada mes para los indicadores de ventas(bajo la grafica anual)
   */
  get maxWidthMaxNumberLabel() {
    return `calc((100% - ${this.widthMxNumber}) / 12)`
  }

  /**
   * Obtiene el width maximo de la los valores 'Y' de la grafica anual
   */
  get widthMxNumber() {
    return `${document.getElementById("maxNumber")?.offsetWidth}px`
  }

  /**
   * Obtiene el porcentaje de ventas del mes actual contra una cantidad definida (450,000)
   */
  get salesIndicator(): any {
    let percent = Math.round((this.totalSalesCurrentMonth * 100) / 450000)
    return { total: 450000, percent: `${percent}%` }
  }

  /**
   * Obtiene el total de ventas del mes actual
   */
  get totalSalesCurrentMonth(): number {
    let currentMonth = this.dates.formatDate(new Date(), 'MMM')
    let sales = this.sales.filter((s: any) => s.shortMonth.toUpperCase() == currentMonth.replace(".","").toUpperCase())

    return Sale.getTotalSalesIncome(sales) //this.getTotalSalesByDelivery(sales)
  }

  /**
   * Obtiene el porcentaje del profit del mes actual contra una cantidad definida (67,000)
   */
  get profitIndicator() {
    let currentMonth = this.dates.formatDate(new Date(), 'MMM')
    currentMonth = currentMonth.toUpperCase().replace(".", "")
    let profits = this.barChartDataBalance.datasets.find(s => s.label == this.balanceType.PROFIT)
    let index = this.barChartDataBalance.labels?.indexOf(currentMonth)
    let profitCurrentMonth = profits?.data[index!]
    let percent = profitCurrentMonth ? Math.round((profitCurrentMonth! * 100) / 67000) : 0
    return { total: 67000, percent: `${percent}%` }
  }

  /**
   * Regresa datos para el indicador de comida
   */
  get foodIndicator() {
    //Obtiene el 40% de las ventas del mes actual para obtener el % de gastos de alimentos
    let percentCurrentMonth = Math.round((this.totalSalesCurrentMonth * 40) / 100)
    let currentMonth = this.dates.formatDate(new Date(), 'MMM')
    let alimentoCategories = this.expenses.filter(e => e.foodCategories.code == 'food.alimentos').filter(e => e.shortMonth.toUpperCase() == currentMonth.replace(".","").toUpperCase())
    let totalExpense = alimentoCategories.reduce((total: number, exp: any) => total + exp.amount, 0)
    let percentExpense = Math.round((totalExpense * 100) / percentCurrentMonth)

    percentExpense = percentExpense ? percentExpense : 0
    return { total: percentCurrentMonth, percent: `${percentExpense}%` }
  }

  /**
   * Regresa un array de los porcentajes del profit por mes
   */
  get profitPercents() {
    let sales = this.barChartDataBalance.datasets.find(s => s.label == this.balanceType.VENTAS)
    let profits = this.barChartDataBalance.datasets.find(s => s.label == this.balanceType.PROFIT)
    let profitsPercents: any = []
    sales?.data.map((s: number, i: number) => {
      let profit = profits?.data[i]
      profit = profit && profit! > 0 ? profit : 0
      let percent = Math.round((profit! / s) * 100)
      profitsPercents.push(`${percent ? percent : 0}%`)
    })

    return profitsPercents
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
            let diningRoom = s.diningRoom.toFixed(2)
            let pickUp = s.pickUp.toFixed(2)
            let takeout = s.takeout.toFixed(2)
            let delivery = s.delivery.toFixed(2)
            let totalDinnigRoom = Sale.totalDinningRoom(s)//s.diningRoom + s.pickUp + s.takeout + s.delivery

            let day = firstUpperCase(s.day)
            let month = this.dates.getMonthName(s.dateSale, 'MMMM')
            let shortMonth = this.dates.getMonthName(s.dateSale, 'MMM')
            let monthNumber = this.dates.getMonthNumber(s.dateSale)
            //this.days.push(s.dateSale)

            let apps = Sale.addPlatafformInData(s)//this.addPlatafformsData(s)

            let totalApps = Sale.totalAppsParrot(apps)//(Number(apps.uber.sale) + Number(apps.didi.sale) + Number(apps.rappi.sale))
            let totalIncomeApps = Sale.totalAppsIncome(apps)//(Number(apps.uber.income) + Number(apps.didi.income) + Number(apps.rappi.income))
            let totalSale = (totalDinnigRoom + totalApps)
            // this.salesByDay.push((totalDinnigRoom + totalIncomeApps))

            return {
              ...s, totalSale: Number(totalSale.toFixed(2)), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: totalDinnigRoom.toFixed(2),
              day, apps, totalApps: Number(totalApps.toFixed(2)), month, monthNumber, totalIncomeApps: Number(totalIncomeApps.toFixed(2)), shortMonth: shortMonth.replace(".", "").toUpperCase()
            }
          })

          this.sales = sales
          this.fillBarChartBalance()
        }
      },
      error: (e) => {
        this.loading.stop()
        this.toast.error("Ocurrio un error al intentar obtener las ventas")
      },
      complete: () => {
        this.loading.stop()
        // this.mainService.setLoading(false)
      }
    })
  }

  /*addPlatafformsData(data: any) {
    let parrot = data.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
    let uber = data.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

    let didi = data.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
    let rappi = data.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

    return { parrot: fixedData(parrot), uber: fixedData(uber), didi: fixedData(didi), rappi: fixedData(rappi) }
  }*/

  /**
   * Obtiene la cantidad de ventas anual
   */
  get totalSales(): number {
    return Sale.getTotalSalesIncome(this.sales)//this.getTotalSalesByDelivery(this.sales)
  }

  /**
   * Obtiene la cantidad de ventas en efectivo
   */
  get totalCash(): number {
    let totalParrot = Sale.getTotalParrot(this.sales)//this.sales.reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    return (totalParrot + this.cuentaPagadaCash) - (this.expensesCash + this.expensesTransfer)
  }

  /**
   * Obtiene la cantidad de ventas por tarjeta
   */
  /*get totalCard(): number {
    let totalCard = Sales.getTotalCard(this.sales)//this.sales.filter((a: any) => a.apps.parrot.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.income), 0)
    let totalApps = Sales.getTotalAppsIncome(this.sales)
    /*totalApps = totalApps + this.sales.filter((s: any) => s.apps.uber.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    totalApps = totalApps + this.sales.filter((s: any) => s.apps.didi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    totalApps = totalApps + this.sales.filter((s: any) => s.apps.rappi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
    return (totalCard + totalApps + this.cuentaPagadaTransfer) - (this.expensesTransfer)
  }*/

  /**
   * Obtiene el profit anual
   */
  get profit(): number {
    return this.totalSales - this.totalExpenses
  }

  /**
   * Obtiene el porcentaje de profit anual
   */
  get profitPercent(): string {
    let percent = this.profit > 0 ? Math.round((this.profit / this.totalSales) * 100): 0
    return `${percent ? percent : 0}%`
  }

  /**
   * Obtiene los datos de las ventas agrupados por mes para la grafica anual
   */
  get salesDataChart(): Array<any> {
    let totalSalesByMonth: Array<any> = []
    let grouping = groupArrayByKey(this.sales, "monthNumber")

    Object.keys(grouping).map((k: any) => {
      let sales = grouping[k]
      let totalSale = Sale.getTotalSalesIncome(sales) //this.getTotalSalesByDelivery(sales)
      totalSalesByMonth.push({ month: sales[0].shortMonth, total: totalSale })
    })

    return totalSalesByMonth
  }

  /**
   * Hace la sumatoria de las ventas por delivery e ingreso
   * @param sales  total de ventas ingreso
   * @returns 
   */
  /*getTotalSalesByDelivery(sales: Array<any>): number {
    let totalDinnigRoom = sales.reduce((total: number, sale: any) => total + Number(sale.diningRoom), 0)
    let totalDelivery = sales.reduce((total: number, sale: any) => total + Number(sale.delivery), 0)
    let totalPickUp = sales.reduce((total: number, sale: any) => total + Number(sale.pickUp), 0)
    let totalTakeout = sales.reduce((total: number, sale: any) => total + Number(sale.takeout), 0)

    let totalUber = sales.reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    let totalDidi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    let totalRappi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)

    return (totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout + totalUber + totalDidi + totalRappi)
  } */

  filterCharts(event: any) {
    this.isBtnParrotActive = event.parrot
    this.typeFilterAppBarChart = event.filter
    this.fillBarChartDays()
  }

  fillBarChartDays() {
    let grouped = groupArrayByKey(this.sales, 'day')
    this.barChartDataDaily.datasets = []
    this.barChartDataDaily.labels = []
    let data: any[] = []

    let barchartLabels = Object.keys(grouped)

    let listTotalDinningRoom: any = []
    let listTotalDidi: any = []
    let listTotalUber: any = []
    let listTotalRappi: any = []
    let listTotalVenta: any = []

    barchartLabels.map((day: any) => {
      let dataDay = grouped[day]
      let totalDinnigRoom = 0
      let totalDidi = 0
      let totalUber = 0
      let totalRappi = 0

      dataDay.map((d: any) => {
        totalDinnigRoom += Number(d.totalDinnigRoom)
        totalDidi += this.isBtnParrotActive == 2 ? Number(d.apps.didi.sale) : Number(d.apps.didi.income)
        totalUber += this.isBtnParrotActive == 2 ? Number(d.apps.uber.sale) : Number(d.apps.uber.income)
        totalRappi += this.isBtnParrotActive == 2 ? Number(d.apps.rappi.sale) : Number(d.apps.rappi.income)
      })

      listTotalDinningRoom.push(totalDinnigRoom)
      listTotalDidi.push(totalDidi)
      listTotalUber.push(totalUber)
      listTotalRappi.push(totalRappi)
      listTotalVenta.push(totalDinnigRoom + totalDidi + totalUber + totalRappi)

      this.barChartDataDaily.labels?.push(day)
    })

    if (this.typeFilterAppBarChart == 1) {
      this.barChartDataDaily.datasets.push({ data: listTotalDinningRoom, label: '', backgroundColor: this.chartColors.dinningRoom, stack: 'a' })
      this.barChartDataDaily.datasets.push({ data: listTotalDidi, label: '', backgroundColor: this.chartColors.didi, stack: 'a' })
      this.barChartDataDaily.datasets.push({ data: listTotalUber, label: '', backgroundColor: this.chartColors.uber, stack: 'a' })
      this.barChartDataDaily.datasets.push({ data: listTotalRappi, label: '', backgroundColor: this.chartColors.rappi, stack: 'a' })
    } else if (this.typeFilterAppBarChart == 2) {
      data.push({ data: listTotalVenta, label: '', backgroundColor: this.chartColors.general, stack: 'a' })
    } else if (this.typeFilterAppBarChart == 3) {
      data.push({ data: listTotalDinningRoom, label: '', backgroundColor: this.chartColors.dinningRoom, stack: 'a' })
    } else if (this.typeFilterAppBarChart == 4) {
      data.push({ data: listTotalUber, label: '', backgroundColor: this.chartColors.uber, stack: 'a' })
    } else if (this.typeFilterAppBarChart == 5) {
      data.push({ data: listTotalRappi, label: '', backgroundColor: this.chartColors.rappi, stack: 'a' })
    } else if (this.typeFilterAppBarChart == 6) {
      data.push({ data: listTotalDidi, label: '', backgroundColor: this.chartColors.didi, stack: 'a' })
    }

    data.map(d => {
      this.barChartDataDaily.datasets.push(d)
    })

    this.updateCharts()

  }

  /**
   * Regresa datos de total de ventas y porcentaje por tipos de pago tarjeta y efectivo
   * @returns 
   */
  get paymentType() {

    return Sale.getPaymentType(this.sales)

    /*let data = this.sales
    let totalParrot = data.reduce((total, sale) => total + Number(sale.apps.parrot.sale), 0)

    let paymentUber = data.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)
    let paymentDidi = data.reduce((total, sale) => total + Number(sale.apps.didi.income), 0)
    let paymentRappi = data.reduce((total, sale) => total + Number(sale.apps.rappi.income), 0)
    let paymentParrot = data.reduce((total, sale) => total + Number(sale.apps.parrot.income), 0)

    let totalPayment = (paymentUber + paymentDidi + paymentRappi + paymentParrot)
    let percentParrot = (totalParrot * 100) / (totalParrot + totalPayment)
    let percentPayment = (totalPayment * 100) / (totalParrot + totalPayment)

    return {
      card: { total: Number(totalPayment.toFixed(2)), percent: percentPayment ? `${Math.round(percentPayment)}%` : '0%' },
      cash: { total: Number(totalParrot.toFixed(2)), percent: percentParrot ? `${Math.round(percentParrot)}%` : '0%' }
    }*/
  }



  async serviceTicketTarget(startDate: string, endDate: string) {
    this.loading.start()
    this.resultService.getTicketTarget(this.brandSelected.id, this.dates.formatDate(startDate, 'YYYY-MM-DD'), this.dates.formatDate(endDate, 'YYYY-MM-DD')).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.ticketsTargetList = res.map((s: any) => {
            let name = firstUpperCase(s.channel.replace("_", " ").toLowerCase())
            return {...s, name}
          })
        } else {
          this.toast.error("Ha ocurrido un error al obtener el Ticket Promedio")
        }
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ha ocurrido un error al obtener el Ticket Promedio")
      },
      complete: () => {
        this.loading.stop()
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

            return { ...e, month, monthNumber, shortMonth: shortMonth.replace(".", "").toUpperCase() }
          })
        }
        this.expenses = res
        this.fillBarChartBalance()
        this.onChangeCategory(0)
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
   * Regresa total de gastos anual
   */
  get totalExpenses(): number {
    /*let totalSum = this.expenses.reduce((total: any, value: any) => total + value.amount, 0)
    return Number(totalSum.toFixed(2))*/
    return Expense.totalExpenses(this.expenses)
  }

  /**
   * Regresa el total de gastos mediante efectivo
   */
  get expensesCash(): number {
    /*return this.expenses.filter((e: any) => e.operationType.code == OperationType.CASH || e.operationType.code == OperationType.BOX)
      .reduce((total: number, obj: any) => total + obj.amount, 0)*/
      return Expense.totalByCash(this.expenses)
  }

  /**
   * Regresa total de gastos mediante transferencia
   */
  get expensesTransfer(): number {
    /*return this.expenses.filter((e: any) => e.operationType.code == OperationType.TRANSFER)
      .reduce((total: number, obj: any) => total + obj.amount, 0)*/
      return Expense.totalByTransfer(this.expenses)
  }

  /**
   * Regresa los datos de los gastos agrupados por mes para la grafica anual
   */
  get expensesDataChart(): Array<any> {
    let totalExpensesByMonth: Array<any> = []
    let grouping = groupArrayByKey(this.expenses, "monthNumber")
    Object.keys(grouping).map((k: any) => {
      let expenses = grouping[k]
      let totalByMonth = expenses.reduce((total: number, obj: any) => total + obj.amount, 0)
      totalExpensesByMonth.push({ month: expenses[0].shortMonth, total: Number(totalByMonth.toFixed(2)) })
    })
    return totalExpensesByMonth
  }

  getFoodCategories() {
    this.mainService.$foodCategories.subscribe((result: any) => {
      if (result) {
        this.foodCategories = result
        this.foodCategories.map((category: any) => {
          let expCategories = this.expenses.filter((e: any) => e.foodCategories.id == category.id)
          let sum = expCategories.reduce((total: any, value: any) => total + value.amount, 0)
          let percent = (sum / this.totalExpenses) * 100
          return { id: category.id, name: category.name, amount: sum.toFixed(2), percent: percent.toFixed(2) }
        })
      }
    })
  }

  onChangeCategory(idCategory: any) {
    if (idCategory == 0) {
      this.foodCategorySelected = 'Todos los proveedores'
      this.typeFilterExpenses = 'ALL'
      this.getFoodSupplier('ALL', 'foodCategory')
    } else {
      let category = this.foodCategories.find((c: any) => c.id == idCategory)
      this.typeFilterExpenses = category.name
      this.foodCategorySelected = `Proveedores de ${category.name}`
      this.getFoodSupplier(category.code, 'provider')
    }
  }

  getFoodSupplier(categorycode: string, groupedBy: string) {
    let foodSupplier: Array<any> = []

    let expenses = categorycode == 'ALL' ? this.expenses.map((e: any) => { return { ...e, provider: e.providerCategories.name, foodCategory: e.foodCategories.name } })
      : this.expenses.filter((e: any) => e.foodCategories.code == categorycode).map((e: any) => { return { ...e, provider: e.providerCategories.name, foodCategory: e.foodCategories.name } })

    let groupedByKey = groupArrayByKey(expenses, groupedBy)

    Object.keys(groupedByKey).map((k: any) => {
      let provider: Array<any> = groupedByKey[k]
      let providerGrouped = groupArrayByKey(provider, 'provider')
      let providers: Array<any> = []

      Object.keys(providerGrouped).map((pk: any) => {
        let total = providerGrouped[pk].reduce((total: number, obj: any) => total + obj.amount, 0)
        providers.push({ name: pk, total: Math.round(total) })
      })

      let total = provider.reduce((total: number, obj: any) => total + obj.amount, 0)
      foodSupplier.push({ name: k, total, providers: sortByKey(providers, 'total') })
    })

    this.foodSupplier = sortByKey(foodSupplier, 'total')
  }

  /** CUENTAS POR COBRAR */

  async getCuentasPorCobrar(startDate: string, endDate: string) {
    this.loading.start()
    this.resultService.getCuentasPorCobrar(this.brandSelected.id, startDate, endDate).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.cuentasPorCobrar = sortByKey(res, "id")
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

  get cuentaPagadaCash(): number {
    return this.cuentasPorCobrar.filter((c: any) => c.isPay && (c.operationType.code == OperationType.CASH || c.operationType.code == OperationType.BOX))
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  get cuentaPagadaTransfer(): number {
    return this.cuentasPorCobrar.filter((c: any) => c.isPay && c.operationType.code == OperationType.TRANSFER)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  updateCharts() {
    this.charts?.forEach(c => {
      c.chart?.update()
    })
  }

}

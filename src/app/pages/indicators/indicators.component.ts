import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';
import { Dates } from 'src/app/util/Dates';
import { Pages, ReportChannel, barChartOptions, fixedData, getKpiColorAndPercent, groupArrayByKey, kpisIndicators } from 'src/app/util/util';
import { SalesService } from '../sales/sales-service.service';
import { ExpenseService } from '../expenses/expenses.service';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { IndicatorService } from './indicator.service';
import { ChartData } from 'chart.js';
import { Charts } from 'src/app/util/Charts';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent implements OnInit {

  private branchSelected: any = {}
  private dates = new Dates()
  private currentYear = this.dates.getCurrentYear()
  private currentMonth = this.dates.getCurrentMonth()
  private filterDate: any = {}
  private foodCatforiesList: Array<any> = []

  private sales: Array<any> = []
  private expenses: Array<any> = []

  readonly barChartOptions = barChartOptions
  readonly chartColors = Charts.chartColors
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] }

  constructor(private mainService: MainService,
    private activeRouter: ActivatedRoute,
    private salesService: SalesService,
    private expenseService: ExpenseService,
    private loading: LoadingService,
    private toast: ToastrService,
    private service: IndicatorService) {

    mainService.setPageName(Pages.INDICATOR)

    this.dates.formatDate

    mainService.$foodCategories.subscribe((r: any) => {
      if (r) {
        this.foodCatforiesList = r
      }
    })
  }

  ngOnInit(): void {
    this.mainService.$brandSelected.subscribe((result: any) => {
      if (result) {
        this.branchSelected = JSON.parse(result)
        this.initFilters()
      }
    })
  }

  /**
   * Cacha el evento cuando se cambia los filtros de fechas
   */
  initFilters() {
    this.mainService.$yearsFilter.subscribe((year: number) => {
      if (this.mainService.currentPage == Pages.INDICATOR) {
        if (year) {
          year = year == 0 ? this.currentYear : year
          this.currentYear = year
          let dates = this.dates.getStartAndEndYear(year)
          this.serviceGetSales(dates.start, dates.end)
          this.serviceGetExpenses(dates.start, dates.end)
        }
      }
    })
  }

  /**
   * Regresa el listado de los meses del año
   */
  get months(): Array<any> {
    return this.dates.getMonths()
  }

  /**
   * Obtiene los nombres de las categorias para la columa inicial de la tabla
   */
  get categoriesIndicator(): Array<any> {
    let list = this.foodCatforiesList.map((s: any) => {
      let indicator = kpisIndicators.find((k: any) => k.code == s.code)
      let kpi = indicator!.chart.includes("$") ? `${this.service.convertToCurrency(indicator!.value)}`
        : `${indicator!.chart.slice(0, 1)}${indicator!.value}${indicator!.chart.slice(1)}`

      return { id: s.id, name: s.name, code: s.code, indicator, kpi, color: Charts.chartColors.gastos }
    })
    let indicatorSale = kpisIndicators.find((k: any) => k.code == 'sale')
    let indicatorProfit = kpisIndicators.find((k: any) => k.code == 'profit')
    list.unshift({ id: 0, name: 'Ventas', code: 'sale', indicator: indicatorSale, kpi: `${this.service.convertToCurrency(indicatorSale!.value)}`, color: Charts.chartColors.ventas})
    list.push({ id: list.length, name: 'Profit', code: 'profit', indicator: indicatorProfit, kpi: `${indicatorProfit!.chart.slice(0, 1)}${indicatorProfit!.value}${indicatorProfit!.chart.slice(1)}`, color: Charts.chartColors.profit })
    return list
  }


  /** Solo regresa los datos de los las categorias de gastos, omite ventas y profit */
  get listCategoryExpensesKpi(): Array<any> {
    let datatable = this.dataTable
    return datatable.splice(1, datatable.length - 2)
  }

  /**
   * Regresa los datos del row de las ventas
   */
  get dataRowSales(): any {
    let datatable = this.dataTable
    return datatable[0]
  }

  /**
   * Regresa los datos del row de profit
   */
  get dataRowProfit(): any {
    let datatable = this.dataTable
    return datatable[datatable.length - 1]
  }

  /**
   * Obtiene todos los datos de ventas, categoria de gastos y profit
   */
  get dataTable(): Array<any> {
    let dataCategories: any = []
    this.profitByMonth
    this.categoriesIndicator.map((c: any) => {
      if (c.code == 'sale') {
        dataCategories.push({ ...c, months: this.salesByMonth, dataChart: this.getChartDataByCategory(this.salesByMonth, c.code) })
      } else if (c.code == 'profit') {
        dataCategories.push({ ...c, months: this.profitByMonth, dataChart: this.getChartDataByCategory(this.profitByMonth, c.code)  })
      } else {
        dataCategories.push({ ...c, months: this.getExpensesByMonthAndCategory(c.code, c.indicator), dataChart: this.getChartDataByCategory(this.getExpensesByMonthAndCategory(c.code, c.indicator), c.code) })
      }
    })
    return dataCategories
  }

  /**
   * Servicio para obtener las ventas de un rango de fechas
   * @param start fecha inicio
   * @param end fecha fin
   */
  async serviceGetSales(start: string, end: string) {
    this.loading.start()
    this.salesService.getReportSalesByDateRange(this.branchSelected.id, start, end).subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {

          this.sales = result.map((s: any) => {
            let monthName = this.dates.getMonthName(s.dateSale, 'MMM')
            let monthNumber = this.dates.getMonthNumber(s.dateSale)
            let apps = this.addPlatafformsData(s)
            return {
              ...s, apps, monthName, monthNumber
            }
          })

        } else {
          this.toast.error("Error", "Ocurrio un error al obtener las ventas")
        }
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Error", "Ocurrio un error al obtener las ventas")
      },
      complete: () => {
        this.loading.stop()
      }
    })
  }

  /**
   * Agrega objetos de las plataformas en el listado de las ventas
   * @param data 
   * @returns 
   */
  addPlatafformsData(data: any) {
    let parrot = data.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
    let uber = data.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

    let didi = data.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
    let rappi = data.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

    return { parrot: fixedData(parrot), uber: fixedData(uber), didi: fixedData(didi), rappi: fixedData(rappi) }
  }

  /**
   * Obtiene los gastos de un rango de fechas en especifico
   * @param start fecha inicio
   * @param end fecha fin
   */
  async serviceGetExpenses(start: string, end: string) {
    this.loading.start()
    this.expenseService.searchExpense(this.branchSelected.id, start, end, "").subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.expenses = result.map((e: any) => {
            let monthNumber = this.dates.getMonthNumber(e.expenseDate)
            let month = this.dates.getMonthName(e.expenseDate, 'MMMM')
            let shortMonth = this.dates.getMonthName(e.expenseDate, 'MMM').replace(".", "")
            return { ...e, month, monthNumber, shortMonth, category: e.foodCategories.code }
          })
        }
      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ocurrio un error al obtener los gastos")
      },
      complete: () => {
        this.loading.stop()
      }
    })
  }

  /**
   * Obtiene las ventas agrupados por mes 
   */
  get salesByMonth() {
    let totalSalesByMonth: Array<any> = []
    let grouping = groupArrayByKey(this.sales, "monthNumber")

    let profit = kpisIndicators.find(s => s.code == 'sale')
    Object.keys(grouping).map((k: any) => {
      let sales = grouping[k]
      let totalSale = this.getTotalSalesByDelivery(sales)
      let kpiColorPercent = getKpiColorAndPercent(profit, totalSale)
      let backgroundColor = sales[0].monthNumber <= (this.dates.getCurrentMonth() + 1) ? kpiColorPercent.backgroundColor : "#ededed"
      let color = sales[0].monthNumber <= (this.dates.getCurrentMonth() + 1) ? kpiColorPercent.color : "#fff"

      totalSalesByMonth.push({ month: sales[0].monthName.replace(".", ""), total: Number(totalSale), monthNumber: sales[0].monthNumber, color, backgroundColor, percent: kpiColorPercent.percent   })
    })

    return totalSalesByMonth
  }

  /**
   * Regresa los gastos de los meses por categoria
   * @param category categoria a consultar
   * @param kpiIndicator  indicador de kpi
   * @returns 
   */
  getExpensesByMonthAndCategory(category: string, kpiIndicator: any) {
    let expCategory = this.expenses.filter((ex: any) => ex.category == category)
    let groupingMonth = groupArrayByKey(expCategory, "shortMonth")
    let totalMonths: any = []

    this.salesByMonth.map((sale: any) => {
      let expenses = groupingMonth[sale.month]
      let total = expenses ? expenses.reduce((total: number, obj: any) => total + obj.amount, 0) : 0
      let kpiColorPercent = getKpiColorAndPercent(kpiIndicator, total, sale.total)
      let backgroundColor = sale.monthNumber <= (this.dates.getCurrentMonth() + 1) ? kpiColorPercent.backgroundColor : "#ededed"
      let color = sale.monthNumber <= (this.dates.getCurrentMonth() + 1) ? kpiColorPercent.color : "#fff"

      totalMonths.push({ month: sale.month, total: Number(total.toFixed(2)), color, backgroundColor, percent: kpiColorPercent.percent})
    })
    return totalMonths
  }

  /**
   * Regresa el profit por mes
   */
  get profitByMonth(): Array<any> {
    let profitByMonth: Array<any> = []
    let expenses = groupArrayByKey(this.expenses, "shortMonth")
    let expensesByMonth: any = []
    Object.keys(expenses).map((m: any) => {
      let totalExpByMonth = expenses[m].reduce((total: number, obj: any) => total + obj.amount, 0)
      expensesByMonth.push({ month: m.replace(".", ""), total: totalExpByMonth })
    })
    let salesKpi = kpisIndicators.find(s => s.code == 'sale')
    let profit = kpisIndicators.find(s => s.code == 'profit')
    this.salesByMonth.map((sale: any) => {
      let ex = expensesByMonth.find((s: any) => s.month == sale.month)
      let total = ex ? sale.total - ex.total : 0
      let kpiColorPercent = getKpiColorAndPercent(profit, total, salesKpi!.value) 
      let backgroundColor = sale.monthNumber <= (this.dates.getCurrentMonth() + 1) ? kpiColorPercent.backgroundColor : "#ededed"
      let color = sale.monthNumber <= (this.dates.getCurrentMonth() + 1) ? kpiColorPercent.color : "#fff"

      profitByMonth.push({ month: sale.month, total: Number(total.toFixed(2)), color, backgroundColor, percent: kpiColorPercent.percent })
    })

    return profitByMonth
  }

  
  /**
   * Obtiene el total de las ventas de ingreso
   * @param sales  listado de ventas a sumar
   * @returns total de la venta
   */
  getTotalSalesByDelivery(sales: Array<any>): number {
    let totalDinnigRoom = sales.reduce((total: number, sale: any) => total + Number(sale.diningRoom), 0)
    let totalDelivery = sales.reduce((total: number, sale: any) => total + Number(sale.delivery), 0)
    let totalPickUp = sales.reduce((total: number, sale: any) => total + Number(sale.pickUp), 0)
    let totalTakeout = sales.reduce((total: number, sale: any) => total + Number(sale.takeout), 0)

    let totalUber = sales.reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    let totalDidi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    let totalRappi = sales.reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)

    return (totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout + totalUber + totalDidi + totalRappi)
  }


  /**
   * Obtiene los datos para las graficas
   * @param data array de datos por mes
   * @param type code: sales, profit ....
   * @returns 
   */
  getChartDataByCategory(data: Array<any>, type: string): ChartData<'bar'> {
    let chartData: ChartData<'bar'> = { labels: [], datasets: [] }
    let values: Array<any> = []
    let backgroudColors : Array<any> = []
    let backgroundColor = type == 'sale' ? this.chartColors.ventas : type == 'profit' ? this.chartColors.profit : this.chartColors.gastos
    data.map((s: any) => {
      chartData.labels?.push(s.month)
      let color = s.color == '#212529'? backgroundColor : '#eb1331'
      backgroudColors.push(color)
      values.push(s.total)
    })
    chartData.datasets.push({ data: values, label: '', backgroundColor: backgroudColors})
    return chartData
  }

  

}



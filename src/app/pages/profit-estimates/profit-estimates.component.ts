import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Expense } from '@expenses/Expense';
import { ExpenseService } from '@expenses/expenses.service';
import { Sale } from '@sales/Sale';
import { SalesService } from '@sales/sales-service.service';
import { Dates } from '@util/Dates';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { MainService } from 'src/app/main/main.service';
import { Pages, firstUpperCase, foodPercents } from 'src/app/util/util';
import { IndicatorService } from '../indicators/indicator.service';

@Component({
  selector: 'app-profit-estimates',
  templateUrl: './profit-estimates.component.html',
  styleUrls: ['./profit-estimates.component.scss']
})
export class ProfitEstimatesComponent implements OnInit {
  private dates = new Dates()
  private yearSelected = this.dates.getCurrentYear()
  private monthSelected: any = {}
  private filterDate: any = {}
  //private readonly kpiIndicators = kpisIndicators

  private foodCategoriesList: Array<any> = []
  foodPercentsList: Array<any> = foodPercents
  percentSelected: any = foodPercents[0]


  private sales: Array<any> = []
  private expenses: Array<any> = []
  private brandSelected: any

  kpiIndicators : Array<any> = []
  estimations: Array<any> = []

  constructor(private mainService: MainService,
    private activeRouter: ActivatedRoute,
    private loading: LoadingService,
    private salesService: SalesService,
    private expenseService: ExpenseService,
    private toast: ToastrService,
    private indicatorService: IndicatorService) {
    mainService.setPageName(Pages.ESTIMATES)
  }

  ngOnInit(): void {
    this.brandSelected = JSON.parse(this.mainService.currentBranch)
    this.initFilters()
    this.getStimations()
    this.getIndicators()
    this.mainService.$foodCategories.subscribe((resp: any) => {
      if (Array.isArray(resp)) {
        this.foodCategoriesList = resp
      }
      // console.log(resp)
    })
  }

  get foodCategories(): Array<any> {
    return this.foodCategoriesList.map(item => {
      return {
        id: item.id,
        name: item.name,
        code: item.code
      }
    })
  }

  /**
 * Cacha el evento cuando se cambia los filtros de fechas
 */
  initFilters() {
    this.mainService.$filterMonth.subscribe((month: any) => {
      if (this.mainService.currentPage == Pages.ESTIMATES) {
        this.monthSelected = month
        let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.yearSelected) : this.dates.getStartAndEndDayMonth(month.id, this.yearSelected)
        this.filterDate = { start: dates.start, end: dates.end }
        this.getReportSalesByDateRange(dates.start, dates.end)
        this.getExpenses(dates.start, dates.end)
      }
    })

    this.mainService.$yearsFilter.subscribe((year: number) => {
      if (this.mainService.currentPage == Pages.ESTIMATES) {
        year = year == 0 ? this.yearSelected : year
        this.yearSelected = year
        if (this.monthSelected.id == 0) {
          this.filterDate = this.dates.getStartAndEndYear(year)
          this.getReportSalesByDateRange(this.filterDate.start, this.filterDate.end)
          this.getExpenses(this.filterDate.start, this.filterDate.end)
        }
      }
    })
  }

  get totalSales(): number {
    return Sale.getTotalSalesIncome(this.sales)
  }

  getStimations() {
    this.loading.start()
   // return [400000, 410000, 420000, 430000, 440000, 450000, 450000, 460000, 470000, 480000, 490000, 500000, 510000, 520000, 530000, 540000, 550000, 650000]
    this.indicatorService.getStimation(this.brandSelected.id).subscribe({
      next: (data: any) => {
        this.estimations = data
      },
      error: () => {
        this.toast.error("Ocurrio un error al obtener las estimaciones")
      },
      complete: () => {
        this.loading.stop()
      }
    })
  }

  onChangePercent(target: any) {
    this.foodPercentsList.map((s: any) => {
      s.selected = s.value == target
    })
    this.percentSelected = this.foodPercentsList.find((s) => s.value == target)
  }

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
            let totalDinnigRoom = Sale.totalDinningRoom(s)

            let day = firstUpperCase(s.day)
            let month = this.dates.getMonthName(s.dateSale, 'MMMM')
            let shortMonth = this.dates.getMonthName(s.dateSale, 'MMM')
            let monthNumber = this.dates.getMonthNumber(s.dateSale)

            let apps = Sale.addPlatafformInData(s)

            let totalApps = Sale.totalAppsParrot(apps)
            let totalIncomeApps = Sale.totalAppsIncome(apps)
            let totalSale = (totalDinnigRoom + totalApps)

            return {
              ...s, totalSale: Number(totalSale.toFixed(2)), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: totalDinnigRoom.toFixed(2),
              day, apps, totalApps: Number(totalApps.toFixed(2)), month, monthNumber, totalIncomeApps: Number(totalIncomeApps.toFixed(2)), shortMonth
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
 * Llama Servicio para obtener los gastos
 * @param start fecha de inicio
 * @param end fecha final
 * @param search texto filtro
 */
  async getExpenses(start: string, end: string, search: string = "") {
    let expense = new Expense(this.expenseService, this.brandSelected)
    this.loading.start()

    expense.callServiceSearchExpenses(start, end, search).then((res: any) => {
      this.loading.stop()
      this.expenses = res
    }, (e: any) => {
      this.toast.error(e)
      this.loading.stop()
    })
  }

  /**
   * Obtiene el calculo de las estimaciones del las ventas del mes seleccioando
   */
  get expensesCategoryGrouped(): Array<any> {
    let result: any = []
    let sumGrouped = Expense.sumTotalExpenseGrouped(this.expenses, "categoryCode")
    if (sumGrouped && Array.isArray(sumGrouped)) {
      this.foodCategories.map((c: any) => {
        let res = this.calculateStimation(this.totalSales, c, sumGrouped)
        result.push(res)
      })
    }
    return result
  }

  /**
   * Regresa el calculo de los gastos estimados con las ventas estimadas
   */
  get otherStimations(): Array<any> {
    let result: any = []
    let sumGrouped = Expense.sumTotalExpenseGrouped(this.expenses, "categoryCode")
    if (sumGrouped && Array.isArray(sumGrouped)) {
      this.foodCategories.map((c: any) => {
        let calculateStimations: any = []
        this.estimations.map((s: number) => {
          let res = this.calculateStimation(s, c, sumGrouped)
          calculateStimations.push(res)
        })

        result.push({ name: c.name, data: calculateStimations })
      })
    }
    return result
  }

  /**
   * Calcula la estimacion 
   * @param totalSale total de ventas
   * @param category categoria
   * @param sumGrouped suma de las categorias agrupadas
   * @returns 
   */
  private calculateStimation(totalSale: number, category: any, sumGrouped: Array<any>) {
    let estimation = 0
    let categoryTotal = sumGrouped.find((cat: any) => cat.name == category.code)
    let todayTotal = categoryTotal ? categoryTotal.total : 0
    let percent = categoryTotal ? 100 : 0
    if (category.code == "food.alimentos") {
      estimation = Number((totalSale * (this.percentSelected.value / 100)).toFixed(2))
    } else {
      let kpi = this.kpiIndicators.find((k: any) => k.code == category.code)
      if (kpi && kpi.chart.includes('%')) {
        estimation = Number((totalSale * (kpi.value / 100)).toFixed(2))
      } else {
        estimation = Number(kpi?.value)
      }
    }
    percent = estimation > 0 ? ((todayTotal * 100) / estimation) : 0
    return { id: category.id, code: category.code, name: category.name, estimation, todayTotal, percent: `${Math.round(percent)}%`, backgroundColor: percent > 100 ? '#ff0000': '#92d050', color: percent > 100 ? '#fff': '#000'}
  }

  /**
   * Total del profit de la estimacion
   */
  get profitStimation(): any{
    let stimationsDay = this.expensesCategoryGrouped
    let sumExpenses = stimationsDay.reduce((total: number, obj: any) => total + obj.estimation, 0)
    let profit = Number((this.totalSales - sumExpenses).toFixed(2))
    let percent = this.profitPercent(profit, this.totalSales)
    return {profit, percent}
  }

  /**
   * Total del profit de Hoy
   */
  get profitToday() {
    let stimationsDay = this.expensesCategoryGrouped
    let sumExpenses = stimationsDay.reduce((total: number, obj: any) => total + obj.todayTotal, 0)
    let profit = Number((this.totalSales - sumExpenses).toFixed(2))
    let percent = this.profitPercent(profit, this.totalSales)
    return {profit, percent}
  }

  get profitOtherStimations() {
    let profits: Array<any> = []
    this.estimations.map((t: number, i: number) => {
      let totals: Array<any> = []
      this.otherStimations.map((ot: any) => {
        totals.push(ot.data[i])
      })
      let totalExpense = totals.reduce((total: number, obj: any) => total + obj.estimation, 0)
      let profit = t - totalExpense
      let percent = this.profitPercent(profit, t)
      profits.push({profit, percent})
    })

    return profits
  }

  profitPercent(profit: number, totalSales: number) {
    let percent = (profit > 0 && totalSales > 0) ? Math.round((profit / totalSales) * 100) : 0
    return `${percent ? percent : 0}%`
  }

  getIndicators() {
    this.loading.start()
  this.indicatorService.getIndicators(this.brandSelected.id).subscribe({
    next: (result: any) => {
      this.kpiIndicators = result
      console.log(result)
    },
    error: () => {
      this.loading.stop()
      this.toast.error("Ocurrio un error al obtener los indicadores kpis")
    },
    complete: () => {
      this.loading.stop()
    }
  })
  }

}



import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartData, ChartOptions, Color } from 'chart.js';
import { MainService } from 'src/app/main/main.service';
import { Dates } from 'src/app/util/Dates';
import { ReportChannel, firstUpperCase, fixedData, lineChartOptions } from 'src/app/util/util';
import { SalesService } from '../sales/sales-service.service';
import { ToastrService } from 'ngx-toastr';
import { ExpenseService } from '../expenses/expenses.service';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  lineChartOptions: ChartOptions = lineChartOptions
  dates = new Dates()
  currentMonthSelected: any = { id: 0, name: 'Anual' }
  currentYear: number = this.dates.getCurrentYear()
  filterDate: any = {}

  brandSelected: any


  public lineChartColors: Color[] = []
  lineChartData: ChartData<'bar'> = {
    datasets: [],
    labels: [],
  };

  days: any = []

  //---- SALES ----
  sales: any[] = []
  totalSales: number = 0
  salesByDay: number[] = []


  //--- EXPENSES ---
  totalExpenses: number = 0
  expenses: any[] = []
  expensesByDay: number[] = []

  //-----PROFITS -----
  profitByDay: number[] = []

  constructor(private mainService: MainService, private activeRouter: ActivatedRoute, private salesService: SalesService, private toast: ToastrService, private expenseService: ExpenseService) {

    this.activeRouter.queryParams.subscribe((params: any) => {
      mainService.setPageName(params.nombre)
    })
  }
  ngOnInit(): void {
    this.mainService.$brandSelected.subscribe((result: any) => {
      if (result) {
        this.brandSelected = JSON.parse(result)
        this.onFilterDates()
      }
    })
  }

  onFilterDates() {
    this.mainService.$filterMonth.subscribe((month: any) => {
      this.currentMonthSelected = month
      let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.currentYear) : this.dates.getStartAndEndDayMonth(month.id, this.currentYear)
      this.filterDate = { start: dates.start, end: dates.end }
      this.getReportSalesByDateRange(dates.start, dates.end)
    })

    this.mainService.$filterRange.subscribe((dates: any) => {
      if (dates) {
        this.filterDate = { start: dates.start, end: dates.end }
        this.getReportSalesByDateRange(dates.start, dates.end)
      }
    })

    this.mainService.$yearsFilter.subscribe((year: any) => {
      this.currentYear = year;
      let months = this.currentMonthSelected.id == 0 ? this.dates.getStartAndEndYear(year) : this.dates.getStartAndEndDayMonth(this.currentMonthSelected.id, year)
      this.filterDate = { start: months.start, end: months.end }
      this.getReportSalesByDateRange(months.start, months.end)
    })
  }

  onCheckedEvent(data: any) {
    if (!data.target) {
      let filter = this.lineChartData.datasets.filter((d:any) => d.label != data.id)
      this.lineChartData.datasets = filter
      this.chart?.update()
    } else {
      if (data.id == 'VENTAS') {
          this.pushDataSalesChart()
      } else if (data.id == 'GASTOS') {
          this.pushDataExpensesChart()
      } else if (data.id == 'PROFIT') {
          this.pushDataProfitChart()
      }
    }
  }

  /** 
   * ----- SALES -----
  */


  getReportSalesByDateRange(startDate: string, endDate: string) {
    this.mainService.isLoading(true)
    this.salesService.getReportSalesByDateRange(this.brandSelected.id, startDate, endDate).subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.lineChartData.datasets = []
          this.chart?.update()
          this.days = []
          let sales = data.map((s: any) => {
            let diningRoom = s.diningRoom.toFixed(2)
            let pickUp = s.pickUp.toFixed(2)
            let takeout = s.takeout.toFixed(2)
            let delivery = s.delivery.toFixed(2)
            let totalDinnigRoom = s.diningRoom + s.pickUp + s.takeout + s.delivery

            let day = firstUpperCase(s.day)
            let month = this.dates.getMonthName(s.dateSale)
            this.days.push(s.dateSale)

            let apps = this.addPlatafformsData(s)

            let totalApps = (Number(apps.uber.sale) + Number(apps.didi.sale) + Number(apps.rappi.sale))
            let totalSale = (totalDinnigRoom + totalApps)
            this.salesByDay.push(totalSale)

            return { ...s, totalSale: totalSale.toFixed(2), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: totalDinnigRoom.toFixed(2), day, apps, totalApps: totalApps.toFixed(2), month }
          })

          this.sales = sales
          this.lineChartData.labels = this.days

          this.pushDataSalesChart()
          this.sumTotalSales()
          this.callServiceSearchExpenses(startDate, endDate)
        }
      },
      error: (e) => {
        this.toast.error("Ocurrio un error al intentar obtener las ventas")
      },
      complete: () => {
        this.mainService.isLoading(false)
        this.getTotalCash()
      }
    })
  }

  addPlatafformsData(data: any) {
    let parrot = data.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
    let uber = data.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

    let didi = data.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
    let rappi = data.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

    return { parrot: fixedData(parrot), uber: fixedData(uber), didi: fixedData(didi), rappi: fixedData(rappi) }
  }

  sumTotalSales() {
    return this.getTotalCard() + this.getTotalApps()
  }

  getTotalCash() : number {
    let totalCash = this.sales.reduce((total:number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    return totalCash
  }

  getTotalCard() : number {
    let totalCard = this.sales.filter((a: any) => a.apps.parrot.isPay).reduce((total:number, sale: any) => total + Number(sale.apps.parrot.income), 0)
    let totalApps = 0
    totalApps = totalApps + this.sales.filter((s: any) => s.apps.uber.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    totalApps = totalApps + this.sales.filter((s: any) => s.apps.didi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    totalApps = totalApps + this.sales.filter((s: any) => s.apps.rappi.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
    return (totalCard + totalApps)
  }

  getTotalPay(): number {
    let totalCard = this.sales.filter((a: any) => !a.apps.parrot.isPay).reduce((total:number, sale: any) => total + Number(sale.apps.parrot.income), 0)
    return totalCard
  }

  getTotalApps() : number{
    let totalApps = 0
    totalApps = totalApps + this.sales.reduce((total: number, sale: any) => total + Number(sale.apps.uber.income), 0)
    totalApps = totalApps + this.sales.reduce((total: number, sale: any) => total + Number(sale.apps.didi.income), 0)
    totalApps = totalApps + this.sales.reduce((total: number, sale: any) => total + Number(sale.apps.rappi.income), 0)
    return totalApps
  }

  getTotal() : number {
    return this.getTotalCash() + this.getTotalCard() + this.getTotalApps()
  }

  getTotalGap(): number{
    return this.getTotal() - (this.totalSales - this.totalExpenses) 
  }


  /**
   * ---- EXPENSES ----
   */

  callServiceSearchExpenses(start: string, end: string, search: string = "") {
    this.mainService.isLoading(true)
    this.expenseService.searchExpense(this.brandSelected.id, start, end, search).subscribe({
      next: (res: any) => {
        this.expenses = res
        this.getExpensesByDay()
        this.sumTotalExpenses()
      },
      error: (e) => {
        this.toast.error("Ha ocurrido un error", "Error")
      },
      complete: () => {
        this.mainService.isLoading(false)
      }
    })
  }

  sumTotalExpenses() {
    let totalSum = this.expenses.reduce((total: any, value: any) => total + value.amount, 0)
    this.totalExpenses = Number(totalSum.toFixed(2))
  }

  getExpensesByDay() {
    this.expensesByDay = []
    let expensesByDay: any[] = []
    this.days.map((day: any) => {
      let total = this.expenses.reduce((total: number, item: any) => moment(item.expenseDate).isSame(moment(day)) ? total + item.amount : total, 0)
      expensesByDay.push(total)
    })
    this.expensesByDay = expensesByDay
    this.pushDataExpensesChart()
    this.getProfitsData()
  }

  getProfitsData() {
    let profitByDay: any[] = []

    this.days.map((d: string, i: number) => {
      let profit = this.salesByDay[i] - this.expensesByDay[i]
      profitByDay.push(profit)
    })

    this.profitByDay = profitByDay

    this.pushDataProfitChart()
  }

  pushDataSalesChart() {
    let index = this.getIndexFronDataChart('VENTAS')
    if (index < 0) {
      this.lineChartData.datasets.push({
        label: 'VENTAS',
        data: this.salesByDay,
        backgroundColor: '#3c8be6',
        borderColor: '#3c8be6',
        pointStyle: 'circle'
      })
      this.chart?.update()
    }
  }

  pushDataExpensesChart() {
    let index = this.getIndexFronDataChart('GASTOS')
    if (index < 0) {
      this.lineChartData.datasets.push({
        label: 'GASTOS',
        data: this.expensesByDay,
        backgroundColor: '#f8a130',
        borderColor: '#f8a130',
        pointStyle: 'circle'
      })
      this.chart?.update()
    }
  }

  pushDataProfitChart() {
    let index = this.getIndexFronDataChart('PROFIT')
    if (index < 0) {
      this.lineChartData.datasets.push({
        label: 'PROFIT',
        data: this.profitByDay,
        backgroundColor: '#63f363',
        borderColor: '#63f363',
        pointStyle: 'circle'
      })
      this.chart?.update()
    }
  }

  getIndexFronDataChart(searchType: string) {
    let index = -1
    this.lineChartData.datasets.find((d: any, i: any) => {
      if (d.label == searchType) {
        index = i
        return d
      }
    })
    return index
  }

}
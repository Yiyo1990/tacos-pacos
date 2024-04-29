import { Component, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartData, ChartOptions, ChartType, Color } from 'chart.js';
import { MainService } from 'src/app/main/main.service';
import { Dates } from 'src/app/util/Dates';
import { BalanceType, OperationType, Pages, PaymentMethod, ReportChannel, TypeModules, barChartOptions, configDropdown, firstUpperCase, fixedData, groupArrayByKey, lineChartOptions, sortByKey } from 'src/app/util/util';
import { SalesService } from '../sales/sales-service.service';
import { ToastrService } from 'ngx-toastr';
import { ExpenseService } from '../expenses/expenses.service';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { Charts } from 'src/app/util/Charts';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ResultService } from './result.service';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { Sale } from '@sales/Sale';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  readonly balanceType = BalanceType
  readonly paymentMethod = PaymentMethod

  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;
  @ViewChild('template', { static: true }) sampleModalRef!: TemplateRef<any>;

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
  totalIncomes: Array<any> = []

  //---- SALES ----
  sales: any[] = []
  salesByDay: number[] = []
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions = barChartOptions
  barChartType: ChartType = 'bar';
  isBtnParrotActive: number = 2
  private typeFilterAppBarChart = 1
  private chartColors = Charts.chartColors
  commerces: any[] = []
  ticketsTargetList: Array<any> = []

  //--- EXPENSES ---
  expenses: any[] = []
  expensesByDay: number[] = []
  foodCategories: any = []
  foodSupplier: any[] = []
  foodCategorySelected: any = 0

  typeFilterExpenses: string = 'ALL'

  //-----PROFITS -----
  profitByDay: number[] = []

  operationsCategories: Array<any> = []


  //---- CUENTAS POR COBRAR ----
  cuentasPorCobrar: Array<any> = []
  modalRef?: BsModalRef;
  readonly configDrodown = configDropdown
  config = {
    backdrop: true,
    ignoreBackdropClick: true
  };
  cuentaPorCobrar = {
    id: null,
    concepto: '',
    monto: "$0.00",
    pago: 'NO',
    tipoPago: { id: 0 }
  }

  loadingServices: Array<any> = []

  totalCash: number = 0.00
  totalCard: number = 0.00

  constructor(private mainService: MainService,
    private activeRouter: ActivatedRoute,
    private salesService: SalesService,
    private toast: ToastrService,
    private expenseService: ExpenseService,
    private modalService: BsModalService,
    private service: ResultService,
    private loading: LoadingService) {

    mainService.setPageName(Pages.RESULT)
  }

  ngOnInit(): void {
    this.mainService.$brandSelected.subscribe((result: any) => {
      if (this.mainService.currentPage == Pages.RESULT) {
        if (result) {
          this.brandSelected = JSON.parse(result)
          this.onFilterDates()
          this.getFoodCategories()
          this.getIncomeForModule()
        }
      }
    })

    this.mainService.$operationCategories.subscribe((res: any) => {
      if (res) {
        res.unshift({ id: 0, name: '-' })
        this.operationsCategories = res
      }
    })
  }

  onFilterDates() {
    this.mainService.$filterMonth.subscribe((month: any) => {
      if (this.mainService.currentPage == Pages.RESULT) {
        this.currentMonthSelected = month
        let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.currentYear) : this.dates.getStartAndEndDayMonth(month.id, this.currentYear)
        this.filterDate = { start: dates.start, end: dates.end }
        this.getReportSalesByDateRange(dates.start, dates.end)
        this.getCuentasPorCobrar()
        this.serviceTicketTarget()
        this.getIncomeForModule()
      }
    })

    this.mainService.$filterRange.subscribe((dates: any) => {
      if (this.mainService.currentPage == Pages.RESULT) {
        if (dates) {
          this.filterDate = { start: dates.start, end: dates.end }
          this.getReportSalesByDateRange(dates.start, dates.end)
          this.getCuentasPorCobrar()
        }
      }
    })

    this.mainService.$yearsFilter.subscribe((year: any) => {
      if (this.mainService.currentPage == Pages.RESULT) {
        this.currentYear = year;
        let months = this.currentMonthSelected.id == 0 ? this.dates.getStartAndEndYear(year) : this.dates.getStartAndEndDayMonth(this.currentMonthSelected.id, year)
        this.filterDate = { start: months.start, end: months.end }
        this.getReportSalesByDateRange(months.start, months.end)
        this.getCuentasPorCobrar()
        this.getIncomeForModule()
      }
    })
  }

  onCheckedEvent(data: any) {
    if (!data.target) {
      let filter = this.lineChartData.datasets.filter((d: any) => d.label != data.id)
      this.lineChartData.datasets = filter
      this.updateCharts()
    } else {
      if (data.id == this.balanceType.VENTAS) {
        this.pushDataSalesChart()
      } else if (data.id == this.balanceType.GASTOS) {
        this.pushDataExpensesChart()
      } else if (data.id == this.balanceType.PROFIT) {
        this.pushDataProfitChart()
      }
    }
  }

  /** 
   * ----- SALES -----
  */
  getReportSalesByDateRange(startDate: string, endDate: string) {
    this.loading.start()
    this.salesByDay = []
    this.sales = []

    let sale = new Sale(this.salesService)
    sale.salesService(startDate, endDate, this.brandSelected.id).then((data: any) => {
      this.days = data.days
      this.salesByDay = data.salesByDay
      this.sales = data.sales
      this.lineChartData.labels = data.days
      this.loading.stop()
      this.pushDataSalesChart()
      this.fillBarChartDays()
      this.callServiceSearchExpenses(startDate, endDate)
    }).catch((e: string) => {
      this.toast.error(e)
      this.loading.stop()
    })
  }

  get totalSales(): number {
    return Sale.getTotalSalesIncome(this.sales)
  }

  /*get totalCash(): number {
    //let sales = this.sales.reduce((total: number, sale: any) => total + Number(sale.apps.parrot.sale), 0)
    let cash = this.totalIncomes.find((s: any) => s.paymentMethod == PaymentMethod.CASH)
    return cash ? cash.income : 0
  } */

  /*get totalCard(): number {
    let card = this.totalIncomes.find((s: any) => s.paymentMethod == PaymentMethod.CARD)
    return card ? card.income : 0
  }*/

  get totalPay(): number {
    let totalPay = this.sales.filter((a: any) => !a.apps.parrot.isPay).reduce((total: number, sale: any) => total + Number(sale.apps.parrot.income), 0)
    return totalPay
  }

  /**
   * Total de la venta en apps que no han sido pagadas
   */
  get totalApps(): number {
    return Sale.totalAppsIncomeNoPaid(this.sales)
  }

  get total(): number {
    return this.totalCash + this.totalCard + this.totalApps + this.totalPay + this.totalPorCobrar
  }

  get totalGap(): number {
    return this.total - this.profit
  }

  get profit(): number {
    return this.totalSales - this.totalExpenses
  }

  get paymentType() {
    return Sale.getPaymentType(this.sales)
  }

  fillBarChartDays() {
    let grouped = groupArrayByKey(this.sales, 'day')
    this.barChartData.datasets = []
    this.barChartData.labels = []
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

      this.barChartData.labels?.push(day)
    })

    if (this.typeFilterAppBarChart == 1) {
      this.barChartData.datasets.push({ data: listTotalDinningRoom, label: '', backgroundColor: this.chartColors.dinningRoom, stack: 'a' })
      this.barChartData.datasets.push({ data: listTotalDidi, label: '', backgroundColor: this.chartColors.didi, stack: 'a' })
      this.barChartData.datasets.push({ data: listTotalUber, label: '', backgroundColor: this.chartColors.uber, stack: 'a' })
      this.barChartData.datasets.push({ data: listTotalRappi, label: '', backgroundColor: this.chartColors.rappi, stack: 'a' })
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
      this.barChartData.datasets.push(d)
    })

    this.updateCharts()

  }

  filterCharts(event: any) {
    this.isBtnParrotActive = event.parrot
    this.typeFilterAppBarChart = event.filter
    this.fillBarChartDays()
  }

  get profitPercent() {
    let percent = this.profit > 0 ? Math.round((this.profit / this.totalSales) * 100) : 0
    return `${percent ? percent : 0}%`
  }

  async serviceTicketTarget() {
    this.loading.start()
    this.service.getTicketTarget(this.brandSelected.id, this.dates.formatDate(this.filterDate.start, 'YYYY-MM-DD'), this.dates.formatDate(this.filterDate.end, 'YYYY-MM-DD')).subscribe({
      next: (res: any) => {
        if (Array.isArray(res)) {
          this.ticketsTargetList = res.map((s: any) => {
            let name = firstUpperCase(s.channel.replace("_", " ").toLowerCase())
            return { ...s, name }
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



  /**
   * ---- EXPENSES ----
   */

  callServiceSearchExpenses(start: string, end: string, search: string = "") {
    this.loading.start()
    this.expenseService.searchExpense(this.brandSelected.id, start, end, search).subscribe({
      next: (res: any) => {
        this.expenses = res
        this.getExpensesByDay()
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

  get totalExpenses(): number {
    let totalSum = this.expenses.reduce((total: any, value: any) => total + value.amount, 0)
    return Number(totalSum.toFixed(2))
  }

  get expensesCash(): number {
    return this.expenses.filter((e: any) => e.operationType.code == OperationType.CASH || e.operationType.code == OperationType.BOX)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  get expensesTransfer(): number {
    return this.expenses.filter((e: any) => e.operationType.code == OperationType.TRANSFER)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  getExpensesByDay() {
    this.expensesByDay = []
    let expensesByDay: any[] = []
    this.days.map((day: any) => {
      let total = this.expenses.reduce((total: number, item: any) => moment(item.expenseDate, 'DD-MM-YYYY HH:mm:ss').isSame(moment(day, 'DD/MM/YYYY')) ? total + item.amount : total, 0)
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
    let index = this.getIndexFronDataChart(this.balanceType.VENTAS)
    if (index < 0) {
      this.lineChartData.datasets.push({
        label: this.balanceType.VENTAS,
        data: this.salesByDay,
        backgroundColor: this.chartColors.ventas,
        borderColor: this.chartColors.ventas,
        pointStyle: 'circle'
      })
      this.updateCharts()
    }
  }

  pushDataExpensesChart() {
    let index = this.getIndexFronDataChart(this.balanceType.GASTOS)
    if (index < 0) {
      this.lineChartData.datasets.push({
        label: this.balanceType.GASTOS,
        data: this.expensesByDay,
        backgroundColor: this.chartColors.gastos,
        borderColor: this.chartColors.gastos,
        pointStyle: 'circle'
      })
      this.updateCharts()
    }
  }

  pushDataProfitChart() {
    let index = this.getIndexFronDataChart(this.balanceType.PROFIT)
    if (index < 0) {
      this.lineChartData.datasets.push({
        label: this.balanceType.PROFIT,
        data: this.profitByDay,
        backgroundColor: this.chartColors.profit,
        borderColor: this.chartColors.profit,
        pointStyle: 'circle'
      })
      this.updateCharts()
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

  updateCharts() {
    this.charts?.forEach(c => {
      c.chart?.update()
    })
  }

  getCommerces() {
    this.commerces = this.brandSelected?.sucursal.commerces.map((c: any) => { return { ...c, total: 0, percent: '100%' } })
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

  /**  CUENTAS POR COBRAR */

  onChangePay(e: any) {
    this.cuentaPorCobrar.pago = e
    if (e == 'NO') this.cuentaPorCobrar.tipoPago.id = 0
  }

  onChangePayType(e: any) {
    this.cuentaPorCobrar.tipoPago.id = e
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(this.sampleModalRef, this.config)
  }

  saveCuentaPorCobrar() {
    if (!this.cuentaPorCobrar.concepto || !this.cuentaPorCobrar.monto) {
      this.toast.error("Ingresa todos los campos", "Error")
      return
    } else if (this.cuentaPorCobrar.pago == 'SI' && this.cuentaPorCobrar.tipoPago.id == 0) {
      this.toast.error("Seleccione un tipo de pago", "Error")
      return
    } else {

      let params = {
        description: "",
        id: this.cuentaPorCobrar.id,
        concept: this.cuentaPorCobrar.concepto,
        amount: Number(this.cuentaPorCobrar.monto.replace("$", "")),
        isPay: this.cuentaPorCobrar.pago == "SI" ? true : false,
        branch: {
          id: Number(this.brandSelected.id)
        },
        operationType: {
          id: this.cuentaPorCobrar.tipoPago.id == 0 ? null : Number(this.cuentaPorCobrar.tipoPago.id)
        }
      }
      this.loading.start()
      this.service.saveCuentasPorCobrar(params).subscribe({
        next: (value) => {
        },
        error: (e) => {
          this.loading.stop()
          this.toast.error("Ha ocurrido un error", "Error")
        },
        complete: () => {
          this.loading.stop()
          this.closeModal()
          this.getCuentasPorCobrar()
        }
      })
    }
  }

  async getCuentasPorCobrar() {
    this.loading.start()
    this.service.getCuentasPorCobrar(this.brandSelected.id, this.filterDate.start, this.filterDate.end).subscribe({
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

  closeModal() {
    this.cuentaPorCobrar = {
      id: null,
      concepto: '',
      monto: "$0.00",
      pago: 'NO',
      tipoPago: { id: 0 }
    }
    this.modalRef?.hide()
  }

  editCuentasPorCobrar(cc: any, template: any) {
    this.cuentaPorCobrar.id = cc.id
    this.cuentaPorCobrar.concepto = cc.concept
    this.cuentaPorCobrar.monto = `$${cc.amount.toFixed(2)}`
    this.cuentaPorCobrar.pago = cc.isPay ? 'SI' : 'NO'
    this.cuentaPorCobrar.tipoPago.id = !cc.operationType ? 0 : cc.operationType.id
    this.openModal(template)
  }

  deleteCuentaPorCobrar() {
    let res = confirm(`¿Esta seguro de eliminar la cuenta por cobrar ${this.cuentaPorCobrar.concepto}?`)

    if (res) {
      this.loading.start()
      this.service.deleteCuentasPorCobrar(this.cuentaPorCobrar.id, this.brandSelected.id).subscribe({
        next: (res: any) => {
          if (res.affected == 1) {
            this.toast.success("La Cuenta por cobrar se ha eliminado exitosamente!", "Success")
            this.getCuentasPorCobrar()
            this.closeModal()
          } else {
            this.toast.error("Ocurrio un error, intente mas tarde")
          }
        },
        error: () => {
          this.loading.stop()
          this.toast.error("Ocurrio un error, intente mas tarde")
        },
        complete: () => {
          this.loading.stop()
        }
      })
    }
  }

  get totalPorCobrar(): number {
    return this.cuentasPorCobrar.filter((s: any) => !s.isPay).reduce((total: number, ob: any) => total + ob.amount, 0)
  }

  get cuentaPagadaCash(): number {
    return this.cuentasPorCobrar.filter((c: any) => c.isPay && (c.operationType.code == OperationType.CASH || c.operationType.code == OperationType.BOX))
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }

  get cuentaPagadaTransfer(): number {
    return this.cuentasPorCobrar.filter((c: any) => c.isPay && c.operationType.code == OperationType.TRANSFER)
      .reduce((total: number, obj: any) => total + obj.amount, 0)
  }


  onChangeTotalIncome(total: any, method: string) {
    let totalIncome = Number(total.replace("$","").replace(",",""))
    if(method == this.paymentMethod.CASH) {
      this.totalCash = totalIncome
    } else {
      this.totalCard = totalIncome
    }
    this.updateIncomeForModule(method, totalIncome)
  }

  async updateIncomeForModule(typePayment: string, totalIncome: number) {
    let data = {
      id: null,
      dateSale: this.dates.getFormatDate(this.filterDate.start, "DD-MM-YYYY"),
      income: totalIncome,
      branchId: this.brandSelected.id,
      module: TypeModules.MAIN,
      paymentMethod: typePayment
    }

    this.service.saveIncomeForModule(data).subscribe({
      next: (res: any) => {
        if(!res) {
          this.toast.error("Ocurrio un error al actualizar el total")
        }
      },
      error: () => {
        this.toast.error("Ocurrio un error al actualizar el total")
      }
    })
  }

  async getIncomeForModule() {
    this.loading.start()
    this.service.getIncomeForModule(this.brandSelected.id, this.dates.getFormatDate(this.filterDate.start, 'DD-MM-YYYY') ,  this.dates.getFormatDate(this.filterDate.end, 'DD-MM-YYYY')).subscribe({
      next: (data: any) => {
        this.loading.stop()
        if (Array.isArray(data)) {
          this.totalIncomes = data.filter((s: any) => s.module == TypeModules.MAIN)
          let cash = this.totalIncomes.find((s: any) => s.paymentMethod == PaymentMethod.CASH)
          let card = this.totalIncomes.find((s: any) => s.paymentMethod == PaymentMethod.CARD)

          this.totalCash = cash ? cash.income : 0
          this.totalCard = card ? card.income : 0

        } else {
          this.toast.error("Ocurrio un error")
        }

      },
      error: () => {
        this.loading.stop()
        this.toast.error("Ocurrio un error al obtener los totales de efectivo y tarjeta")
      }
    })
  }

}


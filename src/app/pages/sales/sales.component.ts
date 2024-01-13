import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MainService } from 'src/app/main/main.service';
import { SalesService } from './sales-service.service';
import { firstUpperCase, groupArrayByKey, barChartOptions, donutChartOptions, pieChartOptions, ReportChannel, fixedData } from 'src/app/util/util';
import { ToastrService } from 'ngx-toastr';
import { Dates } from 'src/app/util/Dates';
import { ChartConfiguration, ChartData, ChartOptions, ChartType } from 'chart.js';
import { Charts } from 'src/app/util/Charts';
import { BaseChartDirective } from 'ng2-charts';
import * as moment from 'moment';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit, AfterViewInit {
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild('fileInput') fileInput: any;
  selectedFile: any;
  brandSelected: any
  dates = new Dates()
  sales: any[] = []
  salesToShow: any[] = []
  currentYear: number = this.dates.getCurrentYear()
  currentMonthSelected: any = { id: 0, name: 'Anual' }
  @ViewChildren(BaseChartDirective) chart: QueryList<BaseChartDirective> | undefined;
  donutChartOptions: ChartConfiguration['options'] = donutChartOptions

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions = barChartOptions
  public barChartType: ChartType = 'bar';

  pieChartOptions: ChartOptions = pieChartOptions
  public pieChartPlugins = [];

  applicationsDataChart: any
  salesDonutChartData: any
  chartColors = { general: '#2b65ab', dinningRoom: "#3889EB", uber: "#31B968", rappi: "#F31A86", didi: "#F37D1A" }
  filterDate: any = {}

  channelSales: any = {}

  isBtnMonthActive = false
  isBtnParrotActive = 2
  private typeFilterBarChart = 2
  private typeFilterAppBarChart = 1

  paymentType: any = {}
  isOpenDesgloce: boolean = false
  isAnual: boolean = false


  constructor(private mainService: MainService, private salesService: SalesService, private toast: ToastrService) {
    mainService.setPageName("Ventas")
  }

  ngAfterViewInit(): void {
    document.getElementById("desgloce")?.click()
    setTimeout(() => {
      let rowBody = document.getElementsByClassName("row-body")
      Array.from(rowBody).forEach(el => el.addEventListener('scroll', e => {
        Array.from(rowBody).forEach(d => {
          d.scrollLeft = el.scrollLeft
        })
      }))
    }, 2000)
  }

  ngOnInit(): void {

    this.mainService.$brandSelected.subscribe((result: any) => {
      if (result) {
        this.brandSelected = JSON.parse(result)
        this.onFilterDates()
      }
    })

    document.getElementById("content-body")?.addEventListener("scroll", (e) => {
      let tbl = document.getElementsByTagName('table')[1]
      let offset = tbl.getBoundingClientRect()

      let header = document.getElementById("hiddenHeader")

      if (offset.top <= 14) {
        header!.style.visibility = 'visible'
      } else {
        header!.style.visibility = 'hidden'
      }
    })
  }

  onFilterDates() {
    this.mainService.$filterMonth.subscribe((month: any) => {
      this.currentMonthSelected = month
      this.isAnual = month.id == 0
      let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.currentYear) : this.dates.getStartAndEndDayMonth(month.id, this.currentYear)
      this.filterDate = { start: dates.start, end: dates.end }
      this.getReportSalesByDateRange(dates.start, dates.end)
    })

    this.mainService.$filterRange.subscribe((dates: any) => {
      if (dates) {
        this.isAnual = false
        this.filterDate = { start: dates.start, end: dates.end }
        this.getReportSalesByDateRange(dates.start, dates.end)
      }
    })

    this.mainService.$yearsFilter.subscribe((year: any) => {
      this.currentYear = year;
      this.isAnual = this.currentMonthSelected.id == 0
      let months = this.currentMonthSelected.id == 0 ? this.dates.getStartAndEndYear(year) : this.dates.getStartAndEndDayMonth(this.currentMonthSelected.id, year)
      this.filterDate = { start: months.start, end: months.end }
      this.getReportSalesByDateRange(months.start, months.end)
    })
  }

  selectFile() {
    document.getElementById('upfile')?.click()
  }

  handleFileInput(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onFileUpload() {
    if (this.selectedFile) {

      this.mainService.isLoading(true)
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.salesService.uploadFileSales(formData).subscribe({
        next: (response: any) => {
          if (response.acknowledge) {
            this.toast.success("El archivo se ha subido correctamente")
            this.getReportSalesByDateRange(response.createdAt, response.createdAt)
          } else {
            this.toast.info("El reporte ya existe", "Info")
          }
        },
        error: (e) => {
          this.toast.error(`Ocurrio un error al subir el archivo: ${e.error.message}`)
          this.mainService.isLoading(false)
        }, complete: () => {
          this.mainService.isLoading(false)
        }
      })

      this.fileInput.nativeElement.value = '';
    }
  }

  getSales() {
    this.mainService.isLoading(true)
    this.salesService.getSales(this.brandSelected.id).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          let sales = res.map(s => {
            return { ...s, date: s.createdAt.substring(0, 10) }
          })

          this.sumDataSales(groupArrayByKey(sales, 'date'))

          this.mainService.isLoading(false)
        } else {
          this.toast.error("Ha ocurrido un error", "Error")
          this.mainService.isLoading(false)
        }
      },
      error: (e) => {
        this.mainService.isLoading(false)
        this.toast.error("Ha ocurrido un error", "Error")
        console.error(e)
      },
      complete: () => {
        // this.mainService.isLoading(false)
      }
    })
  }

  sumDataSales(sales: any) {
    let resultSum: any = []
    let keys = Object.keys(sales)
    keys.map(k => {
      let groupedByOrderType = groupArrayByKey(sales[k], 'orderType')
      let saleDate: any = { date: k, weekDay: this.dates.getWeekDay(k) }
      let total = 0
      Object.keys(groupedByOrderType).map((ot: any) => {
        let suma = groupedByOrderType[ot].reduce((suma: any, item: any) => suma + Number(item.totalOrden), 0)
        saleDate[ot] = suma
        total += suma
      })

      resultSum.push({ ...saleDate, totalSales: total })
    })

    this.dataSource = resultSum
  }

  eventEditable(e: any, b: any) {
    let sale = this.sales.find((s: any) => s.id == e.id)
    //sale.ingresoUber = b.target.innerHTML.replace(/<br>/g,"").replace(/(\r\n|\n|\r)/gm, "");
    console.log(b.keyCode)
    //b.blur()
    console.log(b)
  }

  getReportSalesByDateRange(startDate: string, endDate: string) {
    this.mainService.isLoading(true)
    this.salesService.getReportSalesByDateRange(this.brandSelected.id, startDate, endDate).subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          let sales = data.map((s: any) => {
            let diningRoom = s.diningRoom.toFixed(2)
            let pickUp = s.pickUp.toFixed(2)
            let takeout = s.takeout.toFixed(2)
            let delivery = s.delivery.toFixed(2)
            let totalDinnigRoom = s.diningRoom + s.pickUp + s.takeout + s.delivery

            let day = firstUpperCase(s.day)
            let month = this.dates.getMonthName(s.dateSale)
            let weekday = new Date(s.dateSale).getDay()

            let apps = this.fillSalesTbl(s)

            let totalApps = (Number(apps.uber.sale) + Number(apps.didi.sale) + Number(apps.rappi.sale))
            let totalSale = (totalDinnigRoom + totalApps)

            let totalIncome = (Number(apps.uber.income) + Number(apps.didi.income) + Number(apps.rappi.income)).toFixed(2)
            apps.parrot.commission = Number((Number(apps.parrot.income) * 0.04).toFixed(2))
            //data.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)

            return { ...s, totalSale: totalSale.toFixed(2), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: Number(totalDinnigRoom.toFixed(2)), day, apps, totalApps: totalApps.toFixed(2), month, totalIncome: Number(totalIncome), weekday }
          })

          this.sales = sales
          if (this.isAnual) {
            this.getSalesCurrentMonth()
          } else {
            this.salesToShow = this.sales
            this.isOpenDesgloce = true
          }
          this.getPaymentType()
          this.fillDonughtChart(2)
        }

      },
      error: (e) => {
        this.toast.error("Ocurrio un error al intentar obtener las ventas")
      },
      complete: () => {
        this.mainService.isLoading(false)

      }
    })
  }

  fillSalesTbl(data: any) {
    let parrot = data.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
    let uber = data.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

    let didi = data.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
    let rappi = data.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

    return { parrot: fixedData(parrot), uber: fixedData(uber), didi: fixedData(didi), rappi: fixedData(rappi) }
  }

  fillBarChart(typeFilter: number = 1, type: number = 1) {
    this.typeFilterBarChart = typeFilter == 0 ? this.typeFilterBarChart : typeFilter
    this.typeFilterAppBarChart = type == 0 ? this.typeFilterAppBarChart : type
    this.isBtnMonthActive = this.typeFilterBarChart == 1
    let data: any[] = []
    this.barChartData.datasets = []
    this.barChartData.labels = []

    let grouped = !this.isBtnMonthActive ? groupArrayByKey(this.sales, 'day') : groupArrayByKey(this.sales, 'month')

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

    this.barChartData.datasets.concat(data)

    this.chart?.forEach(c => {
      c.chart?.update()
    })

  }

  fillDonughtChart(type: number = 1) {
    // this.isBtnParrotActive = type == 2
    this.isBtnParrotActive = type
    if (type == 1 || type == 2) {
      let data = this.sales

      let totalDinnigRoom = data.reduce((total, sale) => total + Number(sale.diningRoom), 0)
      let totalDelivery = data.reduce((total, sale) => total + Number(sale.delivery), 0)
      let totalPickUp = data.reduce((total, sale) => total + Number(sale.pickUp), 0)
      let totalTakeout = data.reduce((total, sale) => total + Number(sale.takeout), 0)

      let totalUber = type == 2 ? data.reduce((total, sale) => total + Number(sale.apps.uber.sale), 0) : data.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)
      let totalDidi = type == 2 ? data.reduce((total, sale) => total + Number(sale.apps.didi.sale), 0) : data.reduce((total, sale) => total + Number(sale.apps.didi.income), 0)
      let totalRappi = type == 2 ? data.reduce((total, sale) => total + Number(sale.apps.rappi.sale), 0) : data.reduce((total, sale) => total + Number(sale.apps.rappi.income), 0)

      let total = totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout + totalDidi + totalUber + totalRappi
      let percentDinningRoom = Math.round(((totalDinnigRoom) * 100) / total)
      let percentDelivery = Math.round(((totalDelivery) * 100) / total)
      let percentPickUp = Math.round(((totalPickUp) * 100) / total)
      let percentTakeOut = Math.round(((totalTakeout) * 100) / total)

      let percentDidi = Math.round((totalDidi * 100) / total)
      let percentUber = Math.round((totalUber * 100) / total)
      let percentRappi = Math.round((totalRappi * 100) / total)

      this.channelSales = {
        totalDinnigRoom: (totalDinnigRoom + totalDelivery + totalPickUp + totalTakeout),
        totalUber: totalUber,
        totalDidi: totalDidi,
        totalRappi: totalRappi
      }

      this.salesDonutChartData = Charts.Donut(['Comedor', 'ParaLlevar', 'Recoger', 'Domicilio', 'Uber', 'Didi', 'Rappi'], [percentDinningRoom, percentTakeOut, percentPickUp, percentDelivery, percentUber, percentDidi, percentRappi], [this.chartColors.dinningRoom, this.chartColors.dinningRoom, this.chartColors.dinningRoom, this.chartColors.dinningRoom, this.chartColors.uber, this.chartColors.didi, this.chartColors.rappi])
      this.fillBarChart(this.typeFilterBarChart, this.typeFilterAppBarChart)
    }
    // this.chart?.update()

  }

  setValueIncome(index: number, sale: any, dateSale: string, value: any) {
    if (!value) return

    let newValue = Number(value.replace("$", ""))

    let params: any = this.getObjectIncome(sale, dateSale, newValue, ReportChannel.PARROT)

    this.salesService.setValueIncomeChannel(params).subscribe({
      next: (s: any) => {
        //this.getReportSalesByDateRange(this.filterDate.start, this.filterDate.end)
        if (!s.acknowledge) {
          this.toast.error("Ha ocurrido un error al guardar los datos")
        } else {
          //sale.sale = Number(sale.sale) - Number(sale.income)
          //sale.commission = Number((Number(sale.income) * 0.04).toFixed(2))
          this.sales[index].apps.parrot.sale = Number(sale.sale) - Number(sale.income)
          this.sales[index].apps.parrot.commission = Number((Number(sale.income) * 0.04).toFixed(2))
        }
      },
      error: () => {
        this.toast.error('Ha ocurrido un error', 'Error')
      }
    })
  }

  setIncomePlatforms(sale: any, dateSale: string, value: any, channel: any) {
    if (!value) return

    let newValue = Number(value.replace("$", ""))
    let percent = ((newValue * 100) / sale.sale)
    sale.tax = percent.toFixed(1)

    let channelType = ReportChannel.UBER_EATS
    switch (channel) {
      case 2:
        channelType = ReportChannel.DIDI_FOOD
        break
      case 3:
        channelType = ReportChannel.RAPPI
        break
    }

    let params: any = this.getObjectIncome(sale, dateSale, newValue, channelType)

    this.salesService.setValueIncomeChannel(params).subscribe({
      next: (s: any) => {
        if (!s.acknowledge) {
          this.toast.error("Ha ocurrido un error al guardar los datos")
        } else {
          let totalIncome = (Number(sale.apps.uber.income) + Number(sale.apps.didi.income) + Number(sale.apps.rappi.income)).toFixed(2)
          sale.totalIncome = totalIncome
        }
      },
      error: () => {
        this.toast.error('Ha ocurrido un error', 'Error')
      }
    })

  }

  getObjectIncome(sale: any, dateSale: string, value: any, channel: ReportChannel) {
    let params: any = {}
    params.id = sale.id
    params.dateSale = dateSale
    params.income = value
    params.channel = channel
    params.isPay = sale.isPay
    params.branchId = this.brandSelected.id

    return params
  }

  async getPaymentType() {
    let data = this.sales
    let totalParrot = data.reduce((total, sale) => total + Number(sale.apps.parrot.sale), 0)

    let paymentUber = data.reduce((total, sale) => total + Number(sale.apps.uber.income), 0)
    let paymentDidi = data.reduce((total, sale) => total + Number(sale.apps.didi.income), 0)
    let paymentRappi = data.reduce((total, sale) => total + Number(sale.apps.rappi.income), 0)
    let paymentParrot = data.reduce((total, sale) => total + Number(sale.apps.parrot.income), 0)

    let totalPayment = (paymentUber + paymentDidi + paymentRappi + paymentParrot)
    let percentParrot = (totalParrot * 100) / (totalParrot + totalPayment)
    let percentPayment = (totalPayment * 100) / (totalParrot + totalPayment)
    this.paymentType.totalParrot = Number(totalParrot.toFixed(2))
    this.paymentType.totalPayment = Number(totalPayment.toFixed(2))
    this.paymentType.percentParrot = percentParrot ? `${Math.round(percentParrot)}%` : '0%'
    this.paymentType.percentPayment = percentPayment ? `${Math.round(percentPayment)}%` : '0%'
  }


  getSalesCurrentMonth() {
    this.salesToShow = []
    let startEndMonth = this.dates.getStartAndEndDayMonth(this.dates.getCurrentMonth(), this.dates.getCurrentYear())
    let current = moment(startEndMonth.start.concat(' 00:00:00'), 'DD-MM-YYYY HH:mm:ss')
    while (current.isBetween(moment(startEndMonth.start.concat(' 00:00:00'), 'DD-MM-YYYY HH:mm:ss').subtract(1, 'second'), moment(startEndMonth.end.concat(' 00:00:00'), 'DD-MM-YYYY HH:mm:ss'))) {
      let salesByDay = this.sales.filter(s => s.dateSale == current.format('DD/MM/YYYY'))
      this.salesToShow = this.salesToShow.concat(salesByDay)
      current = current.add(1, 'day')
    }
    this.isOpenDesgloce = true
  }
}


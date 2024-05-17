import { AfterViewInit, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MainService } from 'src/app/main/main.service';
import { SalesService } from './sales-service.service';
import { firstUpperCase, groupArrayByKey, ReportChannel, fixedData, Pages } from 'src/app/util/util';
import { ToastrService } from 'ngx-toastr';
import { Dates } from 'src/app/util/Dates';
import * as moment from 'moment';
import { LoadingService } from 'src/app/components/loading/loading.service';

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
  filterDate: any = {}

  isOpenDesgloce: boolean = false
  isAnual: boolean = false


  constructor(private mainService: MainService,
    private salesService: SalesService,
    private toast: ToastrService,
    private loading: LoadingService) {
    mainService.setPageName(Pages.SALES)
  }

  ngAfterViewInit(): void {
    document.getElementById("desgloce")?.click()
    setTimeout(() => {
      let rowBody = document.getElementsByClassName("hiddenScroll")
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
      console.log( document.getElementsByTagName('table'))
      let headerLeft = document.getElementsByTagName('table')[2]
      let headerRight = document.getElementsByTagName('table')[3]
      if (headerRight) {this.hiddenTblHeader(headerRight, 'hiddenHeader')}
      if (headerRight) {this.hiddenTblHeader(headerRight, 'hiddenHeaderLeft')}
    })
  }

  hiddenTblHeader(tbl: any, id: string){
    let offset = tbl.getBoundingClientRect()

    let header = document.getElementById(id)

    if (offset.top <= 14) {
      header!.style.visibility = 'visible'
    } else {
      header!.style.visibility = 'hidden'
    }
  }

  onFilterDates() {
    this.mainService.$filterMonth.subscribe((month: any) => {
      if (this.mainService.currentPage == Pages.SALES) {
        this.currentMonthSelected = month
        this.isAnual = month.id == 0
        let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.currentYear) : this.dates.getStartAndEndDayMonth(month.id, this.currentYear)
        this.filterDate = { start: dates.start, end: dates.end }
        this.getReportSalesByDateRange(dates.start, dates.end)
      }

    })

    this.mainService.$filterRange.subscribe((dates: any) => {
      if (this.mainService.currentPage == Pages.SALES) {
        if (dates) {
          this.isAnual = false
          this.filterDate = { start: dates.start, end: dates.end }
          this.getReportSalesByDateRange(dates.start, dates.end)
        }
      }
    })

    this.mainService.$yearsFilter.subscribe((year: any) => {
      if (this.mainService.currentPage == Pages.SALES) {
        this.currentYear = year;
        this.isAnual = this.currentMonthSelected.id == 0
        let months = this.currentMonthSelected.id == 0 ? this.dates.getStartAndEndYear(year) : this.dates.getStartAndEndDayMonth(this.currentMonthSelected.id, year)
        this.filterDate = { start: months.start, end: months.end }
        this.getReportSalesByDateRange(months.start, months.end)
      }
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
      this.loading.start()
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
          this.loading.stop()
          this.toast.error(`Ocurrio un error al subir el archivo: ${e.error.message}`)
        }, complete: () => {
          this.loading.stop()
        }
      })

      this.fileInput.nativeElement.value = '';
    }
  }

  getSales() {
    this.loading.start()
    this.salesService.getSales(this.brandSelected.id).subscribe({
      next: (res) => {
        if (Array.isArray(res)) {
          let sales = res.map(s => {
            return { ...s, date: s.createdAt.substring(0, 10) }
          })
          this.sumDataSales(groupArrayByKey(sales, 'date'))
        } else {
          this.toast.error("Ha ocurrido un error", "Error")
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

  getReportSalesByDateRange(startDate: string, endDate: string) {
    this.loading.start()
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
            let shortMonth = this.dates.getMonthName(s.dateSale, 'MMM')
            let weekday = new Date(s.dateSale).getDay()

            let apps = this.fillSalesTbl(s)

            let totalApps = (Number(apps.uber.sale) + Number(apps.didi.sale) + Number(apps.rappi.sale))
            let totalSale = (totalDinnigRoom + totalApps)

            let totalIncome = (Number(apps.uber.income) + Number(apps.didi.income) + Number(apps.rappi.income)).toFixed(2)
            apps.parrot.commission = Number((Number(apps.parrot.income) * 0.04).toFixed(2))

            return { ...s, totalSale: totalSale.toFixed(2), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: Number(totalDinnigRoom.toFixed(2)), day, apps, totalApps: totalApps.toFixed(2), month, totalIncome: Number(totalIncome), weekday,
              shortMonth: shortMonth.replace(".", "").toUpperCase() }
          })

          this.sales = sales
          if (this.isAnual) {
            this.getSalesCurrentMonth()
          } else {
            this.salesToShow = this.sales
            this.isOpenDesgloce = true
          }
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

  fillSalesTbl(data: any) {
    let parrot = data.reportChannel.find((s: any) => s.channel == ReportChannel.PARROT)
    let uber = data.reportChannel.find((s: any) => s.channel == ReportChannel.UBER_EATS)

    let didi = data.reportChannel.find((s: any) => s.channel == ReportChannel.DIDI_FOOD)
    let rappi = data.reportChannel.find((s: any) => s.channel == ReportChannel.RAPPI)

    return { parrot: fixedData(parrot), uber: fixedData(uber), didi: fixedData(didi), rappi: fixedData(rappi) }
  }

  /**
   * Llama servicio para guardar los ingresos de Parrot
   * @param index index del row
   * @param sale venta seleccionada
   * @param value nuevo valor de ingresos
   * @returns 
   */
  setValueIncome(index: number, sale: any, value: any) {
    if (!value) return

    let newValue = Number(value.replace("$", ""))

    let params: any = this.getObjectIncome(sale.apps.parrot, sale.dateSale, newValue, ReportChannel.PARROT)
    this.salesService.setValueIncomeChannel(params).subscribe({
      next: (s: any) => {
        if (!s.acknowledge) {
          this.toast.error("Ha ocurrido un error al guardar los datos")
        } else {
          this.sales[index].apps.parrot.sale = Number(sale.totalDinnigRoom) - Number(sale.apps.parrot.income)
          this.sales[index].apps.parrot.commission = Number((Number(sale.apps.parrot.income) * 0.04).toFixed(2))
        }
      },
      error: () => {
        this.toast.error('Ha ocurrido un error', 'Error')
      }
    })
  }

  /**
   * Llama servicio para guardar el ingreso de las plataformas
   * @param saleP 
   * @param sale 
   * @param dateSale 
   * @param value 
   * @param channel 
   * @returns 
   */
  setIncomePlatforms(saleP: any, sale: any, dateSale: string, value: any, channel: any) {
    if (!value) return

    let newValue = Number(value.replace("$", ""))
    let percent = ((newValue * 100) / saleP.sale)
    saleP.tax = percent.toFixed(1)

    let channelType = ReportChannel.UBER_EATS
    switch (channel) {
      case 2:
        channelType = ReportChannel.DIDI_FOOD
        break
      case 3:
        channelType = ReportChannel.RAPPI
        break
    }

    let params: any = this.getObjectIncome(saleP, dateSale, newValue, channelType)

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

  onChangeIsPay(e: any, type: string, sale: any) {

    switch (type) {
      case ReportChannel.PARROT:
        sale.apps.parrot.isPay = e.value == 'SI'
        this.setValueIncome(e.id, sale, String(sale.apps.parrot.income))
        break;
      case ReportChannel.UBER_EATS:
        sale.apps.uber.isPay = e.value == 'SI'
        this.setIncomePlatforms(sale.apps.uber, sale, sale.dateSale, String(sale.apps.uber.income), 1)
        break;
      case ReportChannel.RAPPI:
        sale.apps.rappi.isPay = e.value == 'SI'
        this.setIncomePlatforms(sale.apps.rappi, sale, sale.dateSale, String(sale.apps.rappi.income), 3)
        break;
      case ReportChannel.DIDI_FOOD:
        sale.apps.didi.isPay = e.value == 'SI'
        this.setIncomePlatforms(sale.apps.didi, sale, sale.dateSale, String(sale.apps.didi.income), 2)
        break;
    }
  }
}


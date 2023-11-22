import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MainService } from 'src/app/main/main.service';
import { SalesService } from './sales-service.service';
import { firstUpperCase, groupArrayByKey } from 'src/app/util/util';
import { ToastrService } from 'ngx-toastr';
import { Dates } from 'src/app/util/Dates';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  dataSource!: MatTableDataSource<any>;
  columnasTblVentas: string[] = ['Fecha', 'Dia', 'Venta Total', 'Comedor', 'Para Llevar', 'Recoger', 'Domicilio', 'Efectivo', 'Pay', 'Comisión', 'Pago'];
  columnasTblPlataformas: string[] = ['Fecha', 'Dia', 'Venta Total', 'Ingreso', '%', 'Pago'];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild('fileInput') fileInput: any;
  selectedFile: any;
  brandSelected: any
  dates = new Dates()
  sales: any[] = []
  currentYear: number = this.dates.getCurrentYear()
  currentMonthSelected: any = { id: 0, name: 'Anual' }


  constructor(private mainService: MainService, private salesService: SalesService, private toast: ToastrService) {
    mainService.setPageName("Ventas")
    this.sales = this.getJsonExample()


  }

  ngOnInit(): void {
    // this.dataSource.paginator = this.paginator;

    this.mainService.$brandSelected.subscribe((result: any) => {
      if (result) {
        this.brandSelected = JSON.parse(result)
        this.onFilterDates()
        //  this.getSales()
      }
    })
  }

  onFilterDates() {
    this.mainService.$filterMonth.subscribe((month: any) => {
      this.currentMonthSelected = month
      console.log(month)
      let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.currentYear) :  this.dates.getStartAndEndDayMonth(month.id, this.currentYear)
      console.log(dates)
      this.getReportSalesByDateRange(dates.start, dates.end)
    })

    this.mainService.$filterRange.subscribe((dates: any) => {
      if (dates) {
        this.getReportSalesByDateRange(dates.start, dates.end)
      }
    })

    this.mainService.$yearsFilter.subscribe((year: any) => {
      this.currentYear = year;
      let months = this.currentMonthSelected.id == 0 ? this.dates.getStartAndEndYear(year) : this.dates.getStartAndEndDayMonth(this.currentMonthSelected.id, year)
      console.log("anual", months)
      this.getReportSalesByDateRange(months.start, months.end)
    })
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
          //console.log(response)
          if(response.acknowledge) {
            this.toast.success("El archivo se ha subido correctamente")
            this.getReportSalesByDateRange(response.createdAt, response.createdAt)
          }
        },
        error: (e) => {
          //console.error(e)
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
        console.log("ventas", res)
        if (Array.isArray(res)) {
          let sales = res.map(s => {
            return { ...s, date: s.createdAt.substring(0, 10) }
          })
          this.sumDataSales(groupArrayByKey(sales, 'date'))
        }
      },
      error: (e) => {
        this.mainService.isLoading(false)
        this.toast.error("Ha ocurrido un error")
        console.error(e)
      },
      complete: () => {
        this.mainService.isLoading(false)
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
    console.log(resultSum)
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
            let totalSale = (totalDinnigRoom + 0)
            let day = firstUpperCase(s.day)
            return { ...s, totalSale: totalSale.toFixed(2), diningRoom: diningRoom, pickUp: pickUp, takeout: takeout, delivery: delivery, totalDinnigRoom: totalDinnigRoom.toFixed(2), day: day }
          })
          this.sales = sales
          console.log("dataSales", sales)
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

  getJsonExample() {
    return [{
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'NO',
      ventaTotal: '$5,000.00'
    },
    {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'NO',
      ventaTotal: '$5,000.00'
    },
    {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'NO',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'NO',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'SI',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'NO',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'SI',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'SI',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'SI',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: '$5,000.00',
      ventaTotal: '$5,000.00'
    }, {
      id: 1,
      fecha: '01/09/2023',
      dia: 'Viernes',
      ventaComedor: '$20,000.00',
      comedor: '$5,000.00',
      llevar: '$5,000.00',
      recoger: '$5,000.00',
      domicilio: '$5,000.00',
      efectivo: '$15,000.00',
      pay: '$5,000.00',
      comision: '$150.00',
      pagoComedor: 'SI',
      ventaApps: '$5,000.00',
      ventaUber: '$5,000.00',
      ingresoUber: '$5,000.00',
      comisionUber: '60%',
      pagoUber: '$5,000.00',
      ventaRappi: '$5,000.00',
      ingresoRappi: '$5,000.00',
      comisionRappi: '60%',
      pagoRappi: '$5,000.00',
      ventaDidi: '$5,000.00',
      ingresoDidi: '$5,000.00',
      comisionDidi: '60%',
      pagoDidi: 'NO',
      ventaTotal: '$5,000.00'
    }]
  }
}


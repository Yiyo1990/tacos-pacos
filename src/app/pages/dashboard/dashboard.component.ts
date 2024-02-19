import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart, ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { MainService } from 'src/app/main/main.service';
import { SalesService } from '../sales/sales-service.service';

//import { default as Annotation } from 'chartjs-plugin-annotation';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{
  private newLabel?= 'New label';
  public lineChartType: ChartType = 'line';
  brandSelected: any

  sales: Array<any> = []

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor(private mainService: MainService, 
      private activeRouter: ActivatedRoute, 
      private loading: LoadingService, 
      private toast: ToastrService,
      private salesService: SalesService) {

    this.activeRouter.queryParams.subscribe((params: any) => {
      mainService.setPageName(params.nombre)
    })

    if (mainService.getPageName() == "Inicio") {
      console.log("pageName", mainService.getPageName())
      mainService.$filterMonth.subscribe((month: any) => {
        if (month) {
          console.log("mes seleccionado", month)
        }
      })
    }
  }

  ngOnInit(): void {
    this.mainService.$brandSelected.subscribe((result: any) => {
      if (result) {
        this.brandSelected = JSON.parse(result)
        this.getReportSalesByDateRange('01-01-2024', '31-12-2024')
      }
    })
  }

  onCheckedEvent(data: any) {
    /*if (!data.target) {
      let filter = this.lineChartData.datasets.filter((d: any) => d.label != data.id)
      this.lineChartData.datasets = filter
      this.updateCharts()
    } else {
      if (data.id == 'VENTAS') {
        this.pushDataSalesChart()
      } else if (data.id == 'GASTOS') {
        this.pushDataExpensesChart()
      } else if (data.id == 'PROFIT') {
        this.pushDataProfitChart()
      }
    }*/
  }

  get totalSales(): number {
    return  0
  }

  get totalExpenses(): number {
    return 0
  }

  get profit(): number {
    return 0
  }

  /** VENTAS */

  getReportSalesByDateRange(startDate: string, endDate: string) {
    this.loading.start()
    
    this.sales = []
    this.salesService.getReportSalesByDateRange(this.brandSelected.id, startDate, endDate).subscribe({
      next: (data: any) => {
        console.log("sales", data)
        /*if (Array.isArray(data)) {
          this.lineChartData.datasets = []
          this.updateCharts()
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
            let totalIncomeApps = (Number(apps.uber.income) + Number(apps.didi.income) + Number(apps.rappi.income))
            let totalSale = (totalDinnigRoom + totalApps)
            //this.salesByDay.push((totalDinnigRoom + totalIncomeApps))

            return { ...s, totalSale: totalSale.toFixed(2), diningRoom, pickUp, takeout, delivery, totalDinnigRoom: totalDinnigRoom.toFixed(2), day, apps, totalApps: totalApps.toFixed(2), month }
          })*/

         // this.sales = sales
         /* this.lineChartData.labels = this.days

          this.pushDataSalesChart()
          this.fillBarChartDays()
          this.callServiceSearchExpenses(startDate, endDate)
        }*/
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


}

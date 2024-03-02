import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';
import { Pages } from 'src/app/util/util';

@Component({
  selector: 'app-profit-estimates',
  templateUrl: './profit-estimates.component.html',
  styleUrls: ['./profit-estimates.component.scss']
})
export class ProfitEstimatesComponent {
  //this.dates
 // private currentMonthSelected = 

  constructor(private mainService: MainService, private activeRouter: ActivatedRoute){
    mainService.setPageName("Estimaciones")
  }


    /**
   * Cacha el evento cuando se cambia los filtros de fechas
   */
    initFilters() {
      this.mainService.$filterMonth.subscribe((month: any) => {
        if (this.mainService.currentPage == Pages.ESTIMATES) {
         /* this.currentMonthSelected = month
          let dates = month.id == 0 ? this.dates.getStartAndEndYear(this.currentYear) : this.dates.getStartAndEndDayMonth(month.id, this.currentYear)
          this.filterDate = { start: dates.start, end: dates.end }
          this.getReportSalesByDateRange(dates.start, dates.end)
          this.getCuentasPorCobrar()
          this.serviceTicketTarget()*/
        }
  
      })
    }
  

  get estimations() {
    return [400000, 410000, 420000, 430000, 440000, 450000, 450000, 460000, 470000, 480000, 490000, 500000, 510000, 520000, 530000, 540000, 550000]
  }
}



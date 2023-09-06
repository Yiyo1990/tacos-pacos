import { Component } from '@angular/core';
import { ChartData, ChartType } from 'chart.js';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.scss']
})
export class BillsComponent {
  constructor(private mainService: MainService){
    mainService.setPageName("Gastos")
    this.getCatalogs()
  }

  public doughnutChartLabels: string[] = [
    'SI',
    'NO'
  ];

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      { data: [350, 450] },
    ],
  };
  public doughnutChartType: ChartType = 'doughnut';


  getCatalogs(){
    this.mainService.$foodCategories.subscribe((result: any) => {
      console.log(result)
    })

    this.mainService.$providersCategories.subscribe((result: any) => {
      console.log(result)
    })

    this.mainService.$operationCategories.subscribe((result: any) => {
      console.log(result)
    })
  }
}

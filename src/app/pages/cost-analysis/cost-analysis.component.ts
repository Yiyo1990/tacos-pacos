import { Component } from '@angular/core';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html',
  styleUrls: ['./cost-analysis.component.scss']
})
export class CostAnalysisComponent {
  constructor(private mainService: MainService){
    mainService.setPageName("Análisis")
  }
}

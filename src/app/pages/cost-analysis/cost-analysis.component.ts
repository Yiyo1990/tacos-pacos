import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-cost-analysis',
  templateUrl: './cost-analysis.component.html',
  styleUrls: ['./cost-analysis.component.scss']
})
export class CostAnalysisComponent {
  constructor(private mainService: MainService, private router: Router){
    mainService.setPageName("Análisis")
  }


  //  constructor(private router: Router){}


  /**
   *  Ir a la pantalla de insumos
   */
  goToInsumos() {
    this.router.navigate([`dashboard/insumos`])
  }
}

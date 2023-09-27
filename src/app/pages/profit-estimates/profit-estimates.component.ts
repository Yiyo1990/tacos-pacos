import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-profit-estimates',
  templateUrl: './profit-estimates.component.html',
  styleUrls: ['./profit-estimates.component.scss']
})
export class ProfitEstimatesComponent {
  constructor(private mainService: MainService, private activeRouter: ActivatedRoute){
    
    this.activeRouter.queryParams.subscribe((params: any) => {
      mainService.setPageName(params.nombre)
    })
  }
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent {
  constructor(private mainService: MainService, private activeRouter: ActivatedRoute){
    
    this.activeRouter.queryParams.subscribe((params: any) => {
      mainService.setPageName(params.nombre)
    })
  }
}

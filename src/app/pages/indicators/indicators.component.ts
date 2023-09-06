import { Component } from '@angular/core';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-indicators',
  templateUrl: './indicators.component.html',
  styleUrls: ['./indicators.component.scss']
})
export class IndicatorsComponent {
  constructor(private mainService: MainService){
    mainService.setPageName("Indicadores")
  }
}

import { Component } from '@angular/core';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.scss']
})
export class CashFlowComponent {
  constructor(private mainService: MainService){
    mainService.setPageName("Cash Flow")
  }
}

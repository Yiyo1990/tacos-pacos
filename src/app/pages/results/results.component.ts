import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent {
  constructor(private mainService: MainService, private activeRouter: ActivatedRoute){
    
    this.activeRouter.queryParams.subscribe((params: any) => {
      mainService.setPageName(params.nombre)
    })
  }
}

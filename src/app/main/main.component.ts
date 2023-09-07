import { Component } from '@angular/core';
import { MainService } from './main.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  currentPage: string = ""

  constructor(private service: MainService) {
    service.getFoodCategories()
    service.getProvidersCategories()
    service.getOperationsCategories()
    service.setBranSelected(sessionStorage.getItem('marcaSeleccionada'))
    service.$pageName.subscribe((name: string) => {
      this.currentPage = name
    })
  }
}

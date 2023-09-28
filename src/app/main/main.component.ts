import { Component } from '@angular/core';
import { MainService } from './main.service';
import { Dates } from '../util/Dates';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  currentPage: string = ""
  messageAlert: string = ""
  showAlert: boolean = true

  months: [any] = new Dates().getMonths()

  constructor(private service: MainService) {
    service.getFoodCategories()
    service.getProvidersCategories()
    service.getOperationsCategories()
    service.setBranSelected(sessionStorage.getItem('marcaSeleccionada'))
    service.$pageName.subscribe((name: string) => {
      this.currentPage = name
    })

    this.months.unshift({id: 0, name: 'Anual'})
    
  }

  onChangeMonth(e: any) {
    let month = this.months.find((month: any) => month.id == e.target.value)
    this.service.onChangeFilterMonth(month)
  }
}

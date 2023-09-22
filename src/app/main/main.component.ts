import { Component } from '@angular/core';
import { MainService } from './main.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  currentPage: string = ""
  messageAlert: string = ""
  showAlert: boolean = true

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

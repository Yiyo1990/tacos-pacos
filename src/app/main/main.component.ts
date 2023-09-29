import { Component, TemplateRef } from '@angular/core';
import { MainService } from './main.service';
import { Dates } from '../util/Dates';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  currentPage: string = ""
  messageAlert: string = ""
  showAlert: boolean = true
  dates = new Dates()

  months: [any] = new Dates().getMonths()
  years: number[] = new Dates().getYears()
  currentYear: number = new Dates().getCurrentYear()
  dateRange: any

  modalRef?: BsModalRef

  constructor(private service: MainService, private modalService: BsModalService) {
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

  onChangeYear(e: any) {
    this.currentYear = e.target.value
    this.service.onChangeYear(this.currentYear)
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
 }

 closeModal() {
    this.modalRef?.hide()
 }

 filterByDateRange(){
  console.log(this.dateRange)
  let start = this.dates.formatDate(this.dateRange[0])
  let end = this.dates.formatDate(this.dateRange[1])
  console.log(start, end)
 }
}

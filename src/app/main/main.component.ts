import { AfterViewInit, Component, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
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

  months: any[] = new Dates().getMonths()
  years: number[] = new Dates().getYears()
  currentYear: number = new Dates().getCurrentYear()
  currentMonth: any = this.months[0]
  dateRange: any
  minDate = new Date()
  maxDate = new Date()

  modalRef?: BsModalRef
  brandData: any

  constructor(private service: MainService, private modalService: BsModalService) {
   
    service.getOperationsCategories()
    service.setBranSelected(sessionStorage.getItem('marcaSeleccionada'))


    this.months.unshift({ id: 0, name: 'Anual' })

    let minMaxDate = this.dates.getStartAndEndYear(this.dates.getCurrentYear())
    this.minDate = this.dates.convertToDate(minMaxDate.start)
    this.maxDate = this.dates.convertToDate(minMaxDate.end)

    this.service.$pageName.subscribe((name: string) => {
      this.currentPage = name
    })

    service.$brandSelected.subscribe((brand: any) => {
      brand = JSON.parse(brand)
      this.brandData = brand
      service.getFoodCategories(brand.id)
      service.getProvidersCategories(brand.id)
    })

    let currenNumbertMonth = (this.dates.getCurrentMonth() + 1)
    let month = this.months.find((month: any) => month.id == currenNumbertMonth)
    this.currentMonth = month
    this.service.onChangeFilterMonth(month)

    this.service.onChangeYear(this.currentYear)
   
  }

  onChangeMonth(e: any) {
    let month = this.months.find((month: any) => month.id == e.target.value)
    this.service.onChangeFilterMonth(month)
  }

  onChangeYear(e: any) {
    this.currentYear = e.target.value
    this.service.onChangeYear(this.currentYear)
    let minMaxDate = this.dates.getStartAndEndYear(this.currentYear)
    this.minDate = this.dates.convertToDate(minMaxDate.start)
    this.maxDate = this.dates.convertToDate(minMaxDate.end)
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template)
  }

  closeModal() {
    this.modalRef?.hide()
  }

  filterByDateRange() {
    let start = this.dates.formatDate(this.dateRange[0])
    let end = this.dates.formatDate(this.dateRange[1])
    this.service.onChangeFilterRange({ start: start, end: end })
    this.closeModal()
  }
}

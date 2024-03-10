import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  private endPoint: string = environment.apiUrl

  private pageName = new BehaviorSubject("")
  $pageName = this.pageName.asObservable()

  private providersCategories = new BehaviorSubject(null)
  $providersCategories = this.providersCategories.asObservable();

  private foodCategories = new BehaviorSubject(null)
  $foodCategories = this.foodCategories.asObservable();

  private operationCategories = new BehaviorSubject(null)
  $operationCategories = this.operationCategories.asObservable();

  private brandSelected = new BehaviorSubject(null)
  $brandSelected = this.brandSelected.asObservable();

  private filterMonth = new BehaviorSubject(null)
  $filterMonth = this.filterMonth.asObservable();

  private yearsFilter = new BehaviorSubject(0)
  $yearsFilter = this.yearsFilter.asObservable();

  private filterRage = new BehaviorSubject(null)
  $filterRange = this.filterRage.asObservable();


  constructor(private http: HttpClient) { }

  setPageName(name: string) {
    this.pageName.next(name)
  }

  get currentPage() {
    return this.pageName.value
  }

  async getProvidersCategories(branchId: number) {
    let url = this.endPoint.concat(`expense/provider-categories/${branchId}`)
    this.http.get(url).subscribe({
      next: (result: any) => {
        this.providersCategories.next(result)
      },
      error: (error) => {
        this.providersCategories.next(error)
      }
    })
  }

  async getFoodCategories(branchId: number) {
    let url = this.endPoint.concat(`expense/food-categories/${branchId}`)
    this.http.get(url).subscribe({
      next: (result: any) => {
        this.foodCategories.next(result)
      },
      error: (error) => {
        this.foodCategories.next(error)
      }
    })
  }

  async getOperationsCategories() {
    let url = this.endPoint.concat('expense/operations-categories')
    this.http.get(url).subscribe({
      next: (result: any) => {
        this.operationCategories.next(result)
      },
      error: (error) => {
        this.operationCategories.next(error)
      }
    })
  }

  setBranSelected(brand: any) {
    this.brandSelected.next(brand)
  }

  get currentBranch(): any {
    return this.brandSelected.value
  }

  onChangeFilterMonth(month: any){
    this.filterMonth.next(month)
  }

  onChangeYear(year: number) {
    this.yearsFilter.next(year)
  }

  onChangeFilterRange(dates: any) {
    this.filterRage.next(dates)
  }

}

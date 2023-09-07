import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  private endPoint: string = environment.apiUrl

  private pageName = new BehaviorSubject("Inicio")
  $pageName = this.pageName.asObservable()

  private providersCategories = new BehaviorSubject(null)
  $providersCategories = this.providersCategories.asObservable();

  private foodCategories = new BehaviorSubject(null)
  $foodCategories = this.foodCategories.asObservable();

  private operationCategories = new BehaviorSubject(null)
  $operationCategories = this.operationCategories.asObservable();

  private brandSelected = new BehaviorSubject(null)
   $brandSelected = this.brandSelected.asObservable();


  constructor(private http: HttpClient) {}

  setPageName(name: string) {
    this.pageName.next(name)
  }

  async getProvidersCategories() {
    let url = this.endPoint.concat('expense/provider-categories')
    this.http.get(url).subscribe({
      next: (result: any) => {
        this.providersCategories.next(result)
      },
      error: (error) => {
        this.providersCategories.next(error)
      }
    })
  }

  async getFoodCategories() {
    let url = this.endPoint.concat('expense/food-categories')
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
}

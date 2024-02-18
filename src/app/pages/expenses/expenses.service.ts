import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private endPoint: string = environment.apiUrl
  private useId: string = "864b10d6-03c3-4ca0-9ee7-e6764d720f94"

  constructor(private httpClient: HttpClient) { }

  getExpenses(branchId: number, userId: string = "864b10d6-03c3-4ca0-9ee7-e6764d720f94") {
    let url = this.endPoint.concat(`expense?branchId=${branchId}&userId=${userId}`)
    return this.httpClient.get(url)
  }

  getProviderByCategory(categoryId: number, branchId: number) {
    let url = this.endPoint.concat(`expense/provider-categories-by-category-id/${categoryId}/${branchId}`)
    return this.httpClient.get(url)
  }

  saveExpense(data: any) {
    let url = this.endPoint.concat(`expense?userId=${this.useId}`)
    return this.httpClient.post(url, data)
  }

  deleteExpense(branchId: number, expenseId: number) {
    let url = this.endPoint.concat(`expense?branchId=${branchId}&id=${expenseId}`)
    return this.httpClient.delete(url)
  }

  searchExpense(brachId: number, startDate: string, endDate: string, search: string) {
    let params: Params = {
      'startDate': startDate,
      'endDate': endDate,
      'search': search,
      'branchId': brachId
    }
    let url = this.endPoint.concat(`expense/search`)
    return this.httpClient.get(url, { params: params })
  }
}

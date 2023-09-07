import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private endPoint: string = environment.apiUrl

  constructor(private httpClient: HttpClient) { }

  getExpenses(branchId: number, userId: string = "864b10d6-03c3-4ca0-9ee7-e6764d720f94") {
    let url = this.endPoint.concat(`expense?branchId=${branchId}&userId=${userId}`)
    return this.httpClient.get(url)
  }
}

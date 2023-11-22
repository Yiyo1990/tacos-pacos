import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})
export class SalesService{
  private endPoint: string = environment.apiUrl

  constructor(private httpClient: HttpClient) { }

  uploadFileSales(data: any) {
    let url = this.endPoint.concat(`report/order/upload`)
    return this.httpClient.post(url, data)
  }

  getSales(branchId: any) {
    let url = this.endPoint.concat(`report/orders/sale?branchId=${branchId}`)
    return this.httpClient.get(url)
  }

  getReportSalesByDateRange(branchId: number, startDate: string, endDate: string) {
    let url = this.endPoint.concat(`report/kpis/reportPerMonth?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`)
    return this.httpClient.get(url)
  }
}

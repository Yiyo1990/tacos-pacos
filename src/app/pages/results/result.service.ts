import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private endPoint: string = environment.apiUrl
  constructor(private httpClient: HttpClient) { }


  getCuentasPorCobrar(branchId: number, startDate: string, endDate: string) {
    let params: Params = {
      'startDate': startDate,
      'endDate': endDate,
      'branchId': branchId
    }
    let url = this.endPoint.concat(`cuentasPorCobrar`)
    return this.httpClient.get(url, { params: params })
  }

  saveCuentasPorCobrar(params: any) {
    let url = this.endPoint.concat(`cuentasPorCobrar`)
    return this.httpClient.post(url, params)
  }

  deleteCuentasPorCobrar(id: any, branchId: number) {
    let url = this.endPoint.concat(`cuentasPorCobrar?branchId=${branchId}&id=${id}`)
    return this.httpClient.delete(url)
  }

  getTicketTarget(branchId: number, startDate: string, endDate: string) {
    let url = this.endPoint.concat(`report/kpis/ticketAndCount?branchId=${branchId}&&startDate=${startDate}&&endDate=${endDate}`)
    return this.httpClient.get(url)
  }

  saveIncomeForModule(data: any) {
    let url = this.endPoint.concat(`report/kpis/incomeForMonthModule`)
    return this.httpClient.post(url, data)
  }

  getIncomeForModule(branchId: number, startDate: string, endDate: string) {
    console.log(startDate,endDate)
    let url = this.endPoint.concat(`report/kpis/incomeForMonthModule?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`)
    return this.httpClient.get(url)
  }
 }

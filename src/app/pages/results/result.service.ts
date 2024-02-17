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
}

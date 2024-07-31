import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {
  private endPoint: string = environment.apiUrl

  constructor(private currencyPipe: CurrencyPipe, private http: HttpClient) { }

  convertToCurrency(value: number) {
    let transform = this.currencyPipe.transform(value, 'USD', 'symbol', '1.2-2');
    return transform
  }

  getIndicators(branchId: number) {
    let url = this.endPoint.concat(`indicador/kpi/${branchId}`)
    return this.http.get(url)
  }

  getStimation(branchId: number) {
    let url = this.endPoint.concat(`indicador/estimacion/${branchId}`)
    return this.http.get(url)
  }
}

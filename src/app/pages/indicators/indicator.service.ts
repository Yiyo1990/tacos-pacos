import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndicatorService {

  constructor(private currencyPipe: CurrencyPipe) { }

  convertToCurrency(value: number) {
    let transform = this.currencyPipe.transform(value, 'USD', 'symbol', '1.2-2');
    return transform
  }
}

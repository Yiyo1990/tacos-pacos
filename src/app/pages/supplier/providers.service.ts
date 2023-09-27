import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  private url = environment.apiUrl

  constructor(private httpClient:HttpClient) {
  }

  getProviders() {
    let url = this.url.concat('expense/provider-categories')
    return this.httpClient.get(url)
  }
}

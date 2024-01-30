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

  getProviders(branchId: number) {
    let url = this.url.concat(`expense/provider-categories/${branchId}`)
    return this.httpClient.get(url)
  }

  getFoodCategoriesByProvider(id: number, branchId: number) {
    let url = this.url.concat(`expense/food-categories-by-provider-id/${id}/${branchId}`)
    return this.httpClient.get(url)
  }


  saveProvider(data: any, branchId: number) {
    let url = this.url.concat(`expense/provider?branchId=${branchId}`)
    return this.httpClient.post(url, data)
  }

  deleteProvider(branchId: number, id: number){
    let url = this.url.concat(`expense/provider?branchId=${branchId}&id=${id}`)
    return this.httpClient.delete(url)
  }

}

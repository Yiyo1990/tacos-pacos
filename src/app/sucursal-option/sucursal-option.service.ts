import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SucursalOptionService {
  private endPoint: string = environment.apiUrl

  constructor(private http: HttpClient) { }

  getMarcas(): Observable<any> {
    let url = this.endPoint.concat('report/brands/tree')
    return this.http.get(url)
  }

}

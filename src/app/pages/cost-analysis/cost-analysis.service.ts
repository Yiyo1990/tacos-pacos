import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CostAnalysisService {

  private url = environment.apiUrl

  constructor(private http: HttpClient) {}

  /**
   * Obtener listado de guisos
   * @param branchId 
   */
  getGuisos(branchId: Number) {
    let url = this.url.concat(`guiso/${branchId}`)
    return this.http.get(url)
  }

  /**
   * Guardo un guiso
   * @param guiso 
   */
  saveGuiso(guiso: any) {
    let url = this.url.concat(`guiso/`)
    return this.http.post(url, guiso)
  }
}

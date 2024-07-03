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

  /**
   * Elimnar guisados
   * @param id id del guiso
   * @param branchId 
   */
  deleteGuiso(id: number, branchId: number) {
    let url = this.url.concat(`guiso/${id}/${branchId}`)
    return this.http.delete(url)
  }
  
  /**
   * Elimnar cada uno de los ingredientes agregados al guiso
   * @param id 
   * @param branchId 
   */
  deleteIngrediente(id: number, branchId: number) {
    let url = this.url.concat(`guiso/detalle/${id}/${branchId}`)
    return this.http.delete(url)
  }
}

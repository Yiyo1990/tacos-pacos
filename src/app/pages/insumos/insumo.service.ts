import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Insumo } from './Insumo';

@Injectable({
  providedIn: 'root'
})
export class InsumoService {
  private url = environment.apiUrl

  /**
   *   constructor(private httpClient:HttpClient) {
  }
   */
  constructor(private httpClient: HttpClient) { }

  /**
   * Llama servicio para obtener el catalogo de insumos
   * @param branchId 
   * @returns 
   */
  getInsumos(branchId: number) {
    let url = this.url.concat(`insumos/${branchId}`)
    return this.httpClient.get(url)
  }


  /**
   * Llama servicio para registrar/actualizar insumos
   * @param data 
   * @param branchId 
   * @returns 
   */
  saveInsumo(data: any, branchId: number) {
    let url = this.url.concat(`insumos?branchId=${branchId}`)
    return this.httpClient.post(url, data)
  }


  /**
   * Servicio para eliminar los insumos
   * @param id 
   * @param branchId 
   * @returns 
   */
  deleteInsumo(id: number, branchId: number) {
    let url = this.url.concat(`insumos/${id}/${branchId}`)
    return this.httpClient.delete(url)
  }


  /**
   * Llama servicio para obtener el catalogo de Unidades de medida
   * @returns 
   */
  getUnidadMedida() {
    let url = this.url.concat(`insumos/insumos-unidad-medida`)
    return this.httpClient.get(url)
  }

  /**
   * Llama servicio para pbtener catalogos de Insumos
   * @param branchId 
   * @returns 
   */
  getInsumoCatalogo(branchId: number) {
    let url = this.url.concat(`insumos/insumos-catalogo/${branchId}`)
    return this.httpClient.get(url)
  }


  /**
   * Servicio para obtener el listado de categorias
   * @param branchId 
   * @returns 
   */
  getInsumosCategories(branchId: number) {
    let url = this.url.concat(`insumos/categorias/${branchId}`)
    return this.httpClient.get(url)
  }
  
}

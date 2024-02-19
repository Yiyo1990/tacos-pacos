import { Injectable } from '@angular/core';
import { MainService } from 'src/app/main/main.service';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingServices: Array<any> = []

  constructor() { }

  start() {
    this.loadingServices.push(this.loadingServices.length + 1)
  }

  stop() {
      this.loadingServices.splice(0, 1)
  }

  get isLoading(): boolean {
    return this.loadingServices.length > 0
  }
}

import { Component } from '@angular/core';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  constructor(private mainService: MainService){
    mainService.setPageName("Inventario")
  }
}

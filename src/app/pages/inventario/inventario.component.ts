import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  constructor(private mainService: MainService, private activeRouter: ActivatedRoute){
    
    this.activeRouter.queryParams.subscribe((params: any) => {
      mainService.setPageName(params.nombre)
    })
  }
}

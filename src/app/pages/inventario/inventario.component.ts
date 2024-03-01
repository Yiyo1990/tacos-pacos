import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from 'src/app/main/main.service';
import { Pages } from 'src/app/util/util';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  constructor(private mainService: MainService, private activeRouter: ActivatedRoute) {

    mainService.setPageName(Pages.INVENTARIO)

  }
}

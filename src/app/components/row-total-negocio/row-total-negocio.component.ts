import { Component, Input } from '@angular/core';

@Component({
  selector: 'row-total-negocio',
  templateUrl: './row-total-negocio.component.html',
  styleUrls: ['./row-total-negocio.component.scss']
})
export class RowTotalNegocioComponent {
  @Input() id: number = 0
  @Input() name: string = ""
  @Input() total: number = 0
  @Input() percent: string = "100%"
  @Input() isChecked: boolean = true
  @Input() imageName: string = ""
}

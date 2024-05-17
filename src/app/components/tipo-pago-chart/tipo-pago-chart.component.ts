import { Component, Input } from '@angular/core';

@Component({
  selector: 'tipo-pago-chart',
  templateUrl: './tipo-pago-chart.component.html',
  styleUrls: ['./tipo-pago-chart.component.scss']
})
export class TipoPagoChartComponent {
  @Input() payment: any
}

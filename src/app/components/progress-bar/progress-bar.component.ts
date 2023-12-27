import { Component, Input } from '@angular/core';

@Component({
  selector: 'progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent {
  @Input() progressColor: string = '#000'
  @Input() progress: string = '30%'
  @Input() ammount: number = 0
}

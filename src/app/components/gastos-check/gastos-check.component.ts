import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'gastos-check',
  templateUrl: './gastos-check.component.html',
  styleUrls: ['./gastos-check.component.scss']
})
export class GastosCheckComponent {
  @Input() name: string = ""
  @Input() ammount: number = 0
  @Input() percent: string = "0%"
  @Input() checked: boolean = true
  @Output() checkedEvent: EventEmitter<any> = new EventEmitter()


  onChecked(e: any): void {
    this.checkedEvent.emit({target: e.target.checked, name: this.name})
  }
}

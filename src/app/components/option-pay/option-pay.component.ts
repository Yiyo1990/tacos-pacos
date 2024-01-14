import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'option-pay',
  templateUrl: './option-pay.component.html',
  styleUrls: ['./option-pay.component.scss']
})
export class OptionPayComponent {


  @Input() index: number = 0
  @Input() isSelected: boolean = false
  @Output() checkedEvent : EventEmitter<any> = new EventEmitter()


  onChangeValue(e: any) {
    this.checkedEvent.emit({id: this.index, value: e})
  }
}

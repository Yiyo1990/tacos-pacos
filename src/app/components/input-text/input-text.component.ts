import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss']
})
export class InputTextComponent {
  @Input() value: string = ""
  @Input() placeholder: string = ""
  @Input() styles: any = {}
  @Output() onChangeEvent: EventEmitter<any> = new EventEmitter()


  onChangeValue(e: any) {
    this.onChangeEvent.emit(e)
  }
}

/**
 *   @Output() checkedEvent : EventEmitter<any> = new EventEmitter()


  onChangeValue(e: any) {
    this.checkedEvent.emit({id: this.index, value: e})
  }
 * 
 */

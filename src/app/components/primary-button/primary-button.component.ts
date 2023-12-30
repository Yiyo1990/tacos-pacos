import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-primary-button',
  templateUrl: './primary-button.component.html',
  styleUrls: ['./primary-button.component.scss']
})
export class PrimaryButtonComponent {
  @Input() description: string = ""
  @Input() backgrounColor: string = "#555"
  @Input() total: string = ""
  @Input() icon: string = ""
  @Output() checkedEvent : EventEmitter<any> = new EventEmitter()


  handleClick(): void {

  }

  onChecked(e: any): void {

    this.checkedEvent.emit({id: this.description, target: e.target.checked})
  }
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'option-pay',
  templateUrl: './option-pay.component.html',
  styleUrls: ['./option-pay.component.scss']
})
export class OptionPayComponent {

  //@Input() isSelected: string = "NO"
  @Input() isSelected: boolean = false
}

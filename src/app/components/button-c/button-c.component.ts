import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button-c',
  templateUrl: './button-c.component.html',
  styleUrls: ['./button-c.component.scss']
})
export class ButtonCComponent {
  @Input() description: string = "";
  @Input() backgrounColor: string = "";
  @Input() link: string = ""
  
}

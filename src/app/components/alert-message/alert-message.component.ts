import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-message',
  templateUrl: './alert-message.component.html',
  styleUrls: ['./alert-message.component.scss']
})
export class AlertMessageComponent {
  @Input() message: string = "";
  visible: boolean = true;

  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}

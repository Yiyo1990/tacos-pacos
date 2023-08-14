import { Component, Input } from '@angular/core';


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


  text: string = "Texto en la división inferior";

  handleClick() {
    console.log("División superior clicleada");
    // Aquí puedes agregar el comportamiento deseado al hacer clic en la división superior
  }
}

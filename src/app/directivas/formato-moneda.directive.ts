import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Directive({
  selector: '[formatoMoneda]'
})
export class FormatoMonedaDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let inputValue = inputElement.value;

    const cursorPosition = inputElement.selectionStart || 0;

    inputValue = inputValue.replace(/[^0-9.]/g, (match, offset, input) => {
      if (match === '.' && input.indexOf('.') === offset) {
        return '.';
      }
      return '';
    });

    const formattedValue = parseFloat(inputValue).toFixed(2);
    this.renderer.setProperty(inputElement, 'value', '$' + formattedValue);
    inputElement.setSelectionRange(cursorPosition, cursorPosition);
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart || 0;

    if ([8, 9, 37, 39, 46].includes(event.keyCode) || (event.keyCode >= 48 && event.keyCode <= 57) || event.key === '.') {
      if (event.keyCode === 8 && cursorPosition === 0) {
        const decimalIndex = inputElement.value.indexOf('.');
        if (decimalIndex !== -1) {
          inputElement.setSelectionRange(decimalIndex + 1, decimalIndex + 1);
        }
      }
      return;
    }
    event.preventDefault();
  }
}

import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[type="text"][noText]'
})
export class NoTextInputDirective {

  constructor(private el: ElementRef) { }

  @HostListener('keyup', ['$event']) onKeyDown(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    inputElement.value = inputValue.slice(0, -1)
  }
}

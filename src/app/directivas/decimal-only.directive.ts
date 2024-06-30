import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[decimalOnly]'
})
export class DecimalOnlyDirective {
  private regex: RegExp = new RegExp(/^\d+(\.\d{0,2})?$/);
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight'];

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Permitir teclas especiales: backspace, tab, end, home, flechas izquierda y derecha
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);

    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData!.getData('text');
    if (!String(pastedText).match(this.regex)) {
      event.preventDefault();
    }
  }

}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGuisadoComponent } from './modal-guisado.component';

describe('ModalGuisadoComponent', () => {
  let component: ModalGuisadoComponent;
  let fixture: ComponentFixture<ModalGuisadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalGuisadoComponent]
    });
    fixture = TestBed.createComponent(ModalGuisadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

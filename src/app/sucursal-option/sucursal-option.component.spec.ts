import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucursalOptionComponent } from './sucursal-option.component';

describe('SucursalOptionComponent', () => {
  let component: SucursalOptionComponent;
  let fixture: ComponentFixture<SucursalOptionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SucursalOptionComponent]
    });
    fixture = TestBed.createComponent(SucursalOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

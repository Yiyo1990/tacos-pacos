import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastosCheckComponent } from './gastos-check.component';

describe('GastosCheckComponent', () => {
  let component: GastosCheckComponent;
  let fixture: ComponentFixture<GastosCheckComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GastosCheckComponent]
    });
    fixture = TestBed.createComponent(GastosCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoPagoChartComponent } from './tipo-pago-chart.component';

describe('TipoPagoChartComponent', () => {
  let component: TipoPagoChartComponent;
  let fixture: ComponentFixture<TipoPagoChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TipoPagoChartComponent]
    });
    fixture = TestBed.createComponent(TipoPagoChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

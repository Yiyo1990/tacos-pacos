import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowTotalNegocioComponent } from './row-total-negocio.component';

describe('RowTotalNegocioComponent', () => {
  let component: RowTotalNegocioComponent;
  let fixture: ComponentFixture<RowTotalNegocioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RowTotalNegocioComponent]
    });
    fixture = TestBed.createComponent(RowTotalNegocioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

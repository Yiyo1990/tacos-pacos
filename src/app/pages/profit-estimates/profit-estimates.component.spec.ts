import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitEstimatesComponent } from './profit-estimates.component';

describe('ProfitEstimatesComponent', () => {
  let component: ProfitEstimatesComponent;
  let fixture: ComponentFixture<ProfitEstimatesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfitEstimatesComponent]
    });
    fixture = TestBed.createComponent(ProfitEstimatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

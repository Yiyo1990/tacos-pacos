import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostAnalysisComponent } from './cost-analysis.component';

describe('CostAnalysisComponent', () => {
  let component: CostAnalysisComponent;
  let fixture: ComponentFixture<CostAnalysisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CostAnalysisComponent]
    });
    fixture = TestBed.createComponent(CostAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

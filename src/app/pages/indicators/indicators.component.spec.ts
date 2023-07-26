import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorsComponent } from './indicators.component';

describe('IndicatorsComponent', () => {
  let component: IndicatorsComponent;
  let fixture: ComponentFixture<IndicatorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndicatorsComponent]
    });
    fixture = TestBed.createComponent(IndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

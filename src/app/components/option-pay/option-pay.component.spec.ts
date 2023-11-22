import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionPayComponent } from './option-pay.component';

describe('OptionPayComponent', () => {
  let component: OptionPayComponent;
  let fixture: ComponentFixture<OptionPayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OptionPayComponent]
    });
    fixture = TestBed.createComponent(OptionPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

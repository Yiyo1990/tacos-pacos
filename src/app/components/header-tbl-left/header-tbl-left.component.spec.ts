import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTblLeftComponent } from './header-tbl-left.component';

describe('HeaderTblLeftComponent', () => {
  let component: HeaderTblLeftComponent;
  let fixture: ComponentFixture<HeaderTblLeftComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderTblLeftComponent]
    });
    fixture = TestBed.createComponent(HeaderTblLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTblSalesComponent } from './header-tbl-sales.component';

describe('HeaderTblSalesComponent', () => {
  let component: HeaderTblSalesComponent;
  let fixture: ComponentFixture<HeaderTblSalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderTblSalesComponent]
    });
    fixture = TestBed.createComponent(HeaderTblSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

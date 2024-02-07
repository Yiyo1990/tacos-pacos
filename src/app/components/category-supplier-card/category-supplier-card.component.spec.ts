import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySupplierCardComponent } from './category-supplier-card.component';

describe('CategorySupplierCardComponent', () => {
  let component: CategorySupplierCardComponent;
  let fixture: ComponentFixture<CategorySupplierCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CategorySupplierCardComponent]
    });
    fixture = TestBed.createComponent(CategorySupplierCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

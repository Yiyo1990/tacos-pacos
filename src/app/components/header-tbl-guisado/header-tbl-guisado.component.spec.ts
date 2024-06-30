import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderTblGuisadoComponent } from './header-tbl-guisado.component';

describe('HeaderTblGuisadoComponent', () => {
  let component: HeaderTblGuisadoComponent;
  let fixture: ComponentFixture<HeaderTblGuisadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderTblGuisadoComponent]
    });
    fixture = TestBed.createComponent(HeaderTblGuisadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

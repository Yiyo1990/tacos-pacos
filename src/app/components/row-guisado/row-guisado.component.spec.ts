import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowGuisadoComponent } from './row-guisado.component';

describe('RowGuisadoComponent', () => {
  let component: RowGuisadoComponent;
  let fixture: ComponentFixture<RowGuisadoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RowGuisadoComponent]
    });
    fixture = TestBed.createComponent(RowGuisadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

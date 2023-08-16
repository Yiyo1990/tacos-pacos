import { TestBed } from '@angular/core/testing';

import { SucursalOptionService } from './sucursal-option.service';

describe('SucursalOptionServiceService', () => {
  let service: SucursalOptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SucursalOptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

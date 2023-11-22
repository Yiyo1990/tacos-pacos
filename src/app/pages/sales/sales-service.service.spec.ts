import { TestBed } from '@angular/core/testing';

import { SalesService } from './sales-service.service';

describe('SalesServiceService', () => {
  let service: SalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

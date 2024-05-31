import { TestBed } from '@angular/core/testing';

import { CostAnalysisService } from './cost-analysis.service';

describe('CostAnalysisService', () => {
  let service: CostAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

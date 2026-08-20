import { TestBed } from '@angular/core/testing';

import { EvalutionService } from './evalution.service';

describe('EvalutionService', () => {
  let service: EvalutionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvalutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

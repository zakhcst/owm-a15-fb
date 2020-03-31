import { TestBed } from '@angular/core/testing';

import { ResolverInitialDataService } from './resolver-initial-data.service';

describe('ResolverInitialDataService', () => {
  let service: ResolverInitialDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResolverInitialDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ResolverFallbackService } from './resolver-fallback.service';

describe('ResolverFallbackService', () => {
  let service: ResolverFallbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResolverFallbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

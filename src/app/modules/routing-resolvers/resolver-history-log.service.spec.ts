import { TestBed } from '@angular/core/testing';

import { ResolverHistoryLogService } from './resolver-history-log.service';

describe('ResolverHistoryLogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResolverHistoryLogService = TestBed.get(ResolverHistoryLogService);
    expect(service).toBeTruthy();
  });
});

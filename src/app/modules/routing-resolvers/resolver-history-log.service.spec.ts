import { TestBed, waitForAsync } from '@angular/core/testing';
import { HistoryLogService } from 'src/app/services/history-log.service';

import { ResolverHistoryLogService } from './resolver-history-log.service';

describe('ResolverHistoryLogService', () => {
  let service: ResolverHistoryLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ {provide: HistoryLogService, useValue: {} }],
    });
    service = TestBed.inject(ResolverHistoryLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve', waitForAsync(() => {
      service.resolve().subscribe((response) => {
        expect(response).toBe(true);
      });
    })
  );
});

import { TestBed, waitForAsync } from '@angular/core/testing';
import { StatsService } from '../../services/stats.service';

import { ResolverStatsService } from './resolver-stats.service';

describe('ResolverStatsService', () => {
  let service: ResolverStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        ResolverStatsService,
        { provide: StatsService, useValue: {} }
      ]
    });
    service = TestBed.inject(ResolverStatsService);
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

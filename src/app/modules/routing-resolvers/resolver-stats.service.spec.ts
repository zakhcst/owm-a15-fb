import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

import { ResolverStatsService } from './resolver-stats.service';

describe('ResolverStatsService', () => {
  let service: ResolverStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
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

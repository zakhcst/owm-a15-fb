import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppModule } from '../../app.module';

import { ResolverCitiesService } from './resolver-cities.service';

describe('ResolverCitiesService', () => {
  let service: ResolverCitiesService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [AppModule],
    })
  );
  beforeEach(() => {
    service = TestBed.inject(ResolverCitiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve', waitForAsync(() => {
      service.resolve().subscribe((response) => {
        expect(response).toBe(true);
      });
  }));
});

import { TestBed, waitForAsync } from '@angular/core/testing';
import { CitiesService } from 'src/app/services/cities.service';

import { ResolverCitiesService } from './resolver-cities.service';

describe('ResolverCitiesService', () => {
  let service: ResolverCitiesService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [ {provide: CitiesService, useValue: {} }],
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

import { TestBed } from '@angular/core/testing';

import { PopulateGchartDataService } from './populate-gchart-data.service';

describe('PopulateGchartDataService', () => {
  let service: PopulateGchartDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopulateGchartDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

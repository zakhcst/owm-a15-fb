import { TestBed } from '@angular/core/testing';

import { NormalizeDataService } from './normalize-data.service';

describe('NormalizeDataService', () => {
  let service: NormalizeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NormalizeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

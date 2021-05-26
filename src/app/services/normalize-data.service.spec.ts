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

  it('should return --ip when ip is not a string', () => {
    const ip: any = 111_222_333_444;
    expect(service.ip(ip)).toBe('--ip');
  });

  it('should return dashed ip', () => {
    const ip = '111.222.333.444';
    expect(service.ip(ip)).toBe('111-222-333-444');
  });

});

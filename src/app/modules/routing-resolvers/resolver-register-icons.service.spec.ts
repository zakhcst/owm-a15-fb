import { TestBed } from '@angular/core/testing';

import { ResolverRegisterIconsService } from './resolver-register-icons.service';

describe('ResolverRegisterIconsService', () => {
  let service: ResolverRegisterIconsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResolverRegisterIconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

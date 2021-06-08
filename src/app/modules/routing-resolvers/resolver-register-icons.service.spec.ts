import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { ResolverRegisterIconsService } from './resolver-register-icons.service';

describe('ResolverRegisterIconsService', () => {
  let service: ResolverRegisterIconsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResolverRegisterIconsService,
        MatIconRegistry
      ]
    });
    service = TestBed.inject(ResolverRegisterIconsService);
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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { GetBrowserIpService } from 'src/app/services/get-browser-ip.service';
import { ResolverIpService } from './resolver-ip.service';

describe('ResolverIpService', () => {
  let service: ResolverIpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResolverIpService,
        { provide: GetBrowserIpService, useValue: {} },
      ]
    });
    service = TestBed.inject(ResolverIpService);
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

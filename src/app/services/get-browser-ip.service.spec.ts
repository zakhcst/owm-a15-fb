import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { GetBrowserIpService } from './get-browser-ip.service';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ErrorsService } from './errors.service';
import { MockErrorsService } from './testing.services.mocks';
import { InitModules } from '../modules/init.module';
import { Store } from '@ngxs/store';
import { cold } from 'jasmine-marbles';
import { delay } from 'rxjs/operators';

describe('GetBrowserIpService', () => {
  let service: GetBrowserIpService;
  let httpClient: HttpClient;
  let mockErrorsService: MockErrorsService;
  let store: Store;

  beforeEach(() => {
    mockErrorsService = new MockErrorsService();

    TestBed.configureTestingModule({
      imports: [InitModules, HttpClientTestingModule, RequiredModules],
      providers: [
        {
          provide: ErrorsService,
          useValue: mockErrorsService,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    store = TestBed.inject(Store);
    service = TestBed.inject(GetBrowserIpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate ip ', () => {
    const ipv4 = '0.0.0.0';
    service.validateIPv4(ipv4).subscribe((result) => {
      expect(result).toBe(ipv4, 'ipv4 failed to validate');
    });
    const ipv4fail = 'x.x.x.x';
    service.validateIPv4(ipv4).subscribe(
      (result) => {
        expect(result).toBe(result, 'ipv4 failed to fail validate');
      },
      (error) => {
        expect(error).toBe('--ip-error-validation', 'ipv4 failed to validate ok');
      }
    );
  });

  it('should getIP', waitForAsync(() => {
    const validIP = '1.1.1.1';
    spyOn(service, 'requestIPv4').and.returnValue(of(validIP));
    service.getIPv4().subscribe((ip) => {
      expect(ip).toBe(validIP);
    });
  })
  );

  it('should return 255.255.255.255 on receiving invalid ipv4', () => {
    const errorMessage = 'IPv4 validation error';
    mockErrorsService.messages = [];
    const invalidIP = '1.1.1.Z';
    spyOn(service, 'requestIPv4').and.returnValue(of(invalidIP));
    service.getIPv4().subscribe(
      (ip) => {
        expect(mockErrorsService.messages.length).toBe(1);
        expect(mockErrorsService.messages[0].logMessage).toContain(errorMessage);
        expect(ip).toBe('255.255.255.255');
      },
      () => {
        fail('On receiving invalid ipv4, failed to catch error');
      }
    );
  });

  it('should return 255.255.255.255 on network or server error', () => {
    const errorMessage = 'Network or Server error';
    mockErrorsService.messages = [];
    spyOn(httpClient, 'get').and.returnValue(throwError(errorMessage));
    service.getIPv4().subscribe(
      (ip) => {
        expect(mockErrorsService.messages.length).toBe(1);
        expect(mockErrorsService.messages[0].logMessage).toContain(errorMessage);
        expect(ip).toBe('255.255.255.255');
      },
      () => {
        fail('On network or server error, failed to catch error');
      }
    );
  });

  it('should refreshIpOnConnect on not connected', waitForAsync(() => {
    const q$ = cold('-f|', { t: true, f: false });
    service.connectedSubscription.unsubscribe();
    const spyOnDispatch = spyOn(store, 'dispatch');
    const spyOnConnected$ = spyOnProperty(service, 'connected$').and.returnValue(q$);
    const spyOnRefreshIP = spyOn(service, 'refreshIp');
    
    service.refreshIpOnConnect()
    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnDispatch).toHaveBeenCalledTimes(1);
      expect(spyOnRefreshIP).toHaveBeenCalledTimes(0);
    });
    expect(spyOnConnected$).toHaveBeenCalledTimes(1);
  }));

  it('should refreshIpOnConnect on connected', waitForAsync(() => {
    const q$ = cold('-t|', { t: true, f: false });
    service.connectedSubscription.unsubscribe();
    const spyOnDispatch = spyOn(store, 'dispatch');
    const spyOnConnected$ = spyOnProperty(service, 'connected$').and.returnValue(q$);
    const spyOnRefreshIP = spyOn(service, 'refreshIp');
    
    service.refreshIpOnConnect();
    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnDispatch).toHaveBeenCalledTimes(0);
      expect(spyOnRefreshIP).toHaveBeenCalledTimes(1);
    });
    expect(spyOnConnected$).toHaveBeenCalledTimes(1);
  }));
  
  it('should refreshIp', waitForAsync(() => {
    const q$ = cold('-d|', { d: 'test data' });
    const spyOnDispatch = spyOn(store, 'dispatch');
    const spyOnGetIPv4 = spyOn(service, 'getIPv4').and.returnValue(q$);
    
    service.refreshIp();
    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnDispatch).toHaveBeenCalledTimes(1);
    });
    expect(spyOnGetIPv4).toHaveBeenCalledTimes(1);
  }));
});

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { GetBrowserIpService } from './get-browser-ip.service';
import { of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SharedModule } from '../modules/shared.module';
import { ErrorsService } from './errors.service';
import { MockErrorsService } from './testing.services.mocks';

describe('GetBrowserIpService', () => {
  let service: GetBrowserIpService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let mockErrorsService: MockErrorsService;

  beforeEach(() => {
    mockErrorsService = new MockErrorsService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RequiredModules, SharedModule],
      providers: [
        {
          provide: ErrorsService,
          useValue: mockErrorsService,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);

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
});

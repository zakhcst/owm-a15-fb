import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { GetBrowserIpService } from './get-browser-ip.service';
import { of, asyncScheduler } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ConstantsService } from './constants.service';

describe('GetBrowserIpService', () => {
  let service: GetBrowserIpService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RequiredModules]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    service = TestBed.get(GetBrowserIpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate ip ', () => {
    const ipv4 = '0.0.0.0';
    expect(service.validateIP(ipv4)).toBe(true, 'ipv4 failed to validate');
    const ipv4fail = 'x.x.x.x';
    expect(service.validateIP(ipv4fail)).toBe(false, 'ipv4 failed to fail');
  });

  it('should receive http request data', () => {
    const validIP = '1.1.1.1';

    httpClient
      .get(ConstantsService.getIpUrl, { responseType: 'text' })
      .subscribe(data => expect(data).toEqual(validIP));
    const req = httpTestingController.expectOne(ConstantsService.getIpUrl);
    expect(req.request.method).toEqual('GET');

    req.flush(validIP);
    httpTestingController.verify();
  });

  it('should getIP', waitForAsync(() => {
    const validIP = '1.1.1.1';
    spyOn(service, 'requestIP').and.returnValue(of(validIP, asyncScheduler));
    service.getIP().subscribe(ip => {
      expect(ip).toBe(validIP);
    });
  }));

  it('should return null on getIP failure', waitForAsync(() => {
    const invalidIP = '1.1.1.Z';
    spyOn(service, 'requestIP').and.returnValue(of(invalidIP, asyncScheduler));
    service.getIP().subscribe(
      ip => {
        expect(ip).toBe('ip-error');
      },
      () => {
        fail();
      }
    );
  }));
});

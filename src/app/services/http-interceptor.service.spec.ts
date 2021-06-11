import { HttpBackend, HttpHandler, HttpRequest } from '@angular/common/http';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { InitModules } from '../modules/init.module';
import { RequiredModules } from '../modules/required.module';
import { ErrorsService } from './errors.service';

import { HttpInterceptorService } from './http-interceptor.service';
import { MockErrorsService, MockHttpBackend } from './testing.services.mocks';

const errorConnectionMessage = 'Connection error';
const errorHttpMessage = 'Http error';
const responseMessage = 'valid response';

describe('HttpInterceptorService', () => {
  let service: HttpInterceptorService;
  let httpBackend: any;
  let errorsService: ErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        InitModules,
        RequiredModules,
      ],
      providers: [
        HttpHandler,
        { provide: ErrorsService, useClass: MockErrorsService },
        { provide: HttpBackend, useClass: MockHttpBackend },
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(HttpInterceptorService);
    httpBackend = TestBed.inject(HttpBackend);
    httpBackend.setMessages(errorConnectionMessage, errorHttpMessage, responseMessage);
    errorsService = TestBed.inject(ErrorsService);
  });

  it('should be created', () => {
    const service: HttpInterceptorService = TestBed.inject(HttpInterceptorService);
    expect(service).toBeTruthy();
  });

  it('should intercept', fakeAsync(() => {
    const spyOnErrorService = spyOn(errorsService, 'add');
    const request: HttpRequest<any> = new HttpRequest('GET', '', { responseType: 'json' });
    service.intercept(request, httpBackend).subscribe(
      (response: any) => {
        expect(response.body.message).toBe(responseMessage);
        expect(spyOnErrorService).toHaveBeenCalledTimes(0);
      },
      (error) => {
        expect(error).toBeFalsy();
      }
    );
  }));

  it('should intercept connection error', fakeAsync(() => {
    const spyOnErrorService = spyOn(errorsService, 'add');
    const request: HttpRequest<any> = new HttpRequest('GET', 'error');

    service.intercept(request, httpBackend).subscribe(
      (response: any) => {
        expect(response).toBeFalsy();
      },
      (error) => {
        expect(error).toContain(errorConnectionMessage);
        expect(spyOnErrorService).toHaveBeenCalledTimes(1);
      }
    );
  }));
  
  it('should intercept http error', fakeAsync(() => {
    const spyOnErrorService = spyOn(errorsService, 'add');
    const request: HttpRequest<any> = new HttpRequest('GET', 'http-error');
    service.intercept(request, httpBackend).subscribe(
      (response: any) => {
        console.log(response);
        expect(response).toBeFalsy();
        fail('should error');
      },
      (error) => {
        expect(error).toContain(errorHttpMessage);
        expect(spyOnErrorService).toHaveBeenCalledTimes(1);
      }
    );
  }));
});

import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { OwmFallbackDataService } from './owm-fallback-data.service';
import { ErrorsService } from './errors.service';
import { getNewDataObject, MockErrorsService } from './testing.services.mocks';
import { IOwmDataModel } from '../models/owm-data.model';
import { ConstantsService } from './constants.service';
import { AppModule } from '../app.module';
import { throwError } from 'rxjs';

describe('OwmFallbackDataService', () => {
  let service: OwmFallbackDataService;
  let mockErrorsService: MockErrorsService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let httpClientSpy: { get: jasmine.Spy };

  beforeEach(
    waitForAsync(() => {
      mockErrorsService = new MockErrorsService();

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule, AppModule],
        providers: [
          HttpClient,
          OwmFallbackDataService,
          {
            provide: ErrorsService,
            useValue: mockErrorsService,
          },
        ],
      });
      httpClient = TestBed.inject(HttpClient);
      httpTestingController = TestBed.inject(HttpTestingController);
      service = TestBed.inject(OwmFallbackDataService);

      httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
      service = new OwmFallbackDataService(httpClientSpy as any, mockErrorsService as any);
    })
  );

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should receive http request data', () => {
    httpClient.get<IOwmDataModel>(ConstantsService.owmFallbackData).subscribe(
      (data) => expect(data).toEqual(getNewDataObject()),
      (error) => fail(error)
    );

    const req = httpTestingController.expectOne(ConstantsService.owmFallbackData);
    expect(req.request.method).toEqual('GET');

    req.flush(getNewDataObject());
    httpTestingController.verify();
  });

  it('should catch, log and re-throw network error', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404,
      statusText: 'Not Found',
    });

    const spyMockErrorsServiceAdd = spyOn(mockErrorsService, 'add').and.callThrough();
    expect(mockErrorsService.messages.length).toBe(0);

    httpClientSpy.get.and.returnValue(throwError(errorResponse));

    service.getData().subscribe(
      (response) => {
        fail('response should have failed');
      },
      (error) => {
        expect(spyMockErrorsServiceAdd).toHaveBeenCalledTimes(1);
        expect(error.status).toBe(404);
        expect(mockErrorsService.messages.length).toBe(1);
        expect(mockErrorsService.messages[0].logMessage).toContain('OwmFallbackDataService: getData:');
        expect(mockErrorsService.messages[0].logMessage).toContain(error.message);
      }
    );
  });
});

import { TestBed, async } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { OwmFallbackDataService } from './owm-fallback-data.service';
import { of, asyncScheduler } from 'rxjs';
import { ErrorsService } from './errors.service';
import { getNewDataObject, MockErrorsService } from './testing.services.mocks';
import { IOwmData } from '../models/owm-data.model';
import { ConstantsService } from './constants.service';

describe('OwmFallbackDataService', () => {
  let service: OwmFallbackDataService;
  let mockErrorsService: MockErrorsService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async(() => {
    mockErrorsService = new MockErrorsService();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RequiredModules],
      providers: [
        {
          provide: ErrorsService,
          useValue: mockErrorsService
        }
      ]
    });
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);

    service = TestBed.get(OwmFallbackDataService);
  }));

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should receive http request data', () => {
    httpClient
      .get<IOwmData>(ConstantsService.owmFallbackData)
      .subscribe(
        data => expect(data).toEqual(getNewDataObject()),
        error => fail(error)
      );

    const req = httpTestingController.expectOne(
      ConstantsService.owmFallbackData
    );
    expect(req.request.method).toEqual('GET');

    req.flush(getNewDataObject());
    httpTestingController.verify();
  });

  // it('should return value', async((done: DoneFn) => {
  it('should return value', async(() => {
    spyOn(service, 'getData').and.returnValue(
      of(getNewDataObject(), asyncScheduler)
    );
    service.getData().subscribe(
      response => {
        expect(response).toEqual(getNewDataObject());
        // done();
      },
      error => fail(error)
    );
  }));

  // it('should catch, log and re-throw network error', (done: DoneFn) => {
  it('should catch, log and re-throw network error', async(() => {
    const errorMessage = 'Error message';
    const mockError = new ErrorEvent('Network error', {
      message: errorMessage
    });
    const spyMockErrorsServiceAdd = spyOn(
      mockErrorsService,
      'add'
    ).and.callThrough();
    expect(mockErrorsService.messages.length).toBe(0);

    service.getData().subscribe(
      response => {
        fail('response should have failed');
        // done();
      },
      error => {
        expect(spyMockErrorsServiceAdd).toHaveBeenCalledTimes(1);
        expect(error.status).toBe(0);
        expect(mockErrorsService.messages.length).toBe(1);
        expect(mockErrorsService.messages[0].logMessage).toContain(
          'OwmFallbackDataService: getData:'
        );
        expect(mockErrorsService.messages[0].logMessage).toContain(
          error.message
        );
        // done();
      }
    );

    const req = httpTestingController.expectOne(
      ConstantsService.owmFallbackData
    );
    expect(req.request.method).toEqual('GET');
    req.error(mockError);
    httpTestingController.verify();
  }));

  // it('should catch, log and re-throw server error', (done: DoneFn) => {
  it('should catch, log and re-throw server error', async(() => {
    const errorMessage = 'Error message';
    const spyMockErrorsServiceAdd = spyOn(
      mockErrorsService,
      'add'
    ).and.callThrough();
    expect(mockErrorsService.messages.length).toBe(0);

    service.getData().subscribe(
      response => {
        fail('response should have failed');
        // done();
      },
      error => {
        expect(spyMockErrorsServiceAdd).toHaveBeenCalledTimes(1);
        expect(mockErrorsService.messages.length).toBe(1);
        expect(error.status).toBe(404);
        expect(mockErrorsService.messages[0].logMessage).toContain(
          'OwmFallbackDataService: getData:'
        );
        expect(mockErrorsService.messages[0].logMessage).toContain(
          error.message
        );

        // done();
      }
    );

    const req = httpTestingController.expectOne(
      ConstantsService.owmFallbackData
    );
    expect(req.request.method).toEqual('GET');

    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    httpTestingController.verify();
  }));
});

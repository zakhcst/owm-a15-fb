import { TestBed, waitForAsync } from '@angular/core/testing';
import { OwmService } from './owm.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { of, throwError } from 'rxjs';
import { ErrorsService } from './errors.service';
import { getNewDataObject, MockErrorsService } from './testing.services.mocks';
import { SnackbarService } from './snackbar.service';
import { AppModule } from '../app.module';

describe('OwmService', () => {
  let service: OwmService;
  let mockErrorsService: MockErrorsService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  const cityId = 'cityId';
  
  beforeEach(() => {
    mockErrorsService = new MockErrorsService();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppModule],
      providers: [
        SnackbarService,
        {
          provide: ErrorsService,
          useValue: mockErrorsService,
        },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);

    service = TestBed.inject(OwmService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return value', waitForAsync(() => {
    spyOn(service, 'getData').and.returnValue(of(getNewDataObject()));
    service.getData(cityId).subscribe(
      (response) => {
        expect(response).toEqual(getNewDataObject());
      },
      (error) => fail(error)
    );
  }));

  it('should catch, log and re-throw network error', () => {
    const errorMessage = 'Network or Server error';
    mockErrorsService.messages = [];
    const spyHttpClient = spyOn(httpClient, 'get').and.returnValue(throwError(errorMessage));
    const spyMockErrorsServiceAdd = spyOn(mockErrorsService, 'add').and.callThrough();

    service.getData(cityId).subscribe(
      (response) => {
        fail('service should have thrown error');
        console.log(response);
      },
      (error) => {
        expect(spyMockErrorsServiceAdd).toHaveBeenCalledTimes(1);
        expect(mockErrorsService.messages.length).toBe(1);
        expect(mockErrorsService.messages[0].logMessage).toContain('OwmService:');
        expect(mockErrorsService.messages[0].logMessage).toContain(errorMessage);
      }
    );
  });
});

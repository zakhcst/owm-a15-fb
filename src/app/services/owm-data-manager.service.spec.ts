import { TestBed, waitForAsync } from '@angular/core/testing';

import { OwmDataManagerService } from './owm-data-manager.service';
import { OwmService } from './owm.service';
import { DataService } from './data.service';
import { CitiesService } from './cities.service';
import { OwmFallbackDataService } from './owm-fallback-data.service';
import { ErrorsService } from './errors.service';

import {
  MockDataService,
  MockOwmService,
  MockCitiesService,
  MockErrorsService,
  MockOwmFallbackDataService,
  getNewDataObject,
} from './testing.services.mocks';
import { SnackbarService } from './snackbar.service';
import { AppModule } from '../app.module';

describe('OwmDataManagerService', () => {
  let service: OwmDataManagerService;
  let mockDataService: MockDataService;
  let mockOwmService: MockOwmService;
  let mockCitiesService: MockCitiesService;
  let mockOwmFallbackDataService: MockOwmFallbackDataService;
  let mockErrorsService: MockErrorsService;
  let dataService: DataService;

  beforeEach(
    waitForAsync(() => {
      mockOwmService = new MockOwmService();
      mockDataService = new MockDataService();
      mockCitiesService = new MockCitiesService();
      mockOwmFallbackDataService = new MockOwmFallbackDataService();
      mockErrorsService = new MockErrorsService();

      TestBed.configureTestingModule({
        imports: [AppModule],
        declarations: [],
        providers: [
          {
            provide: OwmService,
            useValue: mockOwmService,
          },
          {
            provide: DataService,
            useValue: mockDataService,
          },
          {
            provide: CitiesService,
            useValue: mockCitiesService,
          },
          {
            provide: OwmFallbackDataService,
            useValue: mockOwmFallbackDataService,
          },
          {
            provide: ErrorsService,
            useValue: mockErrorsService,
          },
          SnackbarService,
        ],
      });
      service = TestBed.inject(OwmDataManagerService);
      dataService = TestBed.inject(DataService);
    })
  );

  it(
    'should be created',
    waitForAsync(() => {
      expect(service).toBeTruthy();
      expect(dataService).toBeTruthy();
    })
  );

  it(
    'getDataDB: should return new data when existing has expired',
    waitForAsync(() => {
      // const reads = mockCitiesService.reads;
      mockErrorsService.messages = [];
      const spyDataServiceGetData = spyOn(mockDataService, 'getData').and.callThrough();
      const spyFallBackDataServiceGetData = spyOn(mockOwmFallbackDataService, 'getData').and.callThrough();

      service.getDataDB('citiId').subscribe(
        (responseData) => {
          // expect(mockCitiesService.reads).toBe(reads + 1);
          expect(mockErrorsService.messages.length).toBe(0);
          expect(spyDataServiceGetData).toHaveBeenCalledTimes(1);
          expect(spyFallBackDataServiceGetData).toHaveBeenCalledTimes(0);
          // fails getOwmData because of not valid cityId
          // and defaults to the fallback data
          delete responseData.updated;
          expect(responseData).toEqual(getNewDataObject());
          // done();
        },
        (error) => fail(error)
      );
    })
  );

  // it('requestNewOwmData: should requestNewOwmData', (done: DoneFn) => {
  it(
    'requestNewOwmData: should requestNewOwmData',
    waitForAsync(() => {
      mockDataService.dbData = null;
      service.getDataOWM('citiId').subscribe(
        (responseData) => {
          delete responseData.updated;
          expect(responseData).toEqual(getNewDataObject());
          // expect(mockDataService.dbData.listByDate).toEqual(getNewDataObject().listByDate);
          // done();
        },
        (error) => fail(error)
      );
    })
  );

  it('setListByDate: should set listByDate', () => {
    expect(service.setListByDate(getNewDataObject('owm')).listByDate).toBeTruthy();
  });

  it('isNotExpired: fallback/sample data should be expired', () => {
    const expiredData = getNewDataObject('owm');
    const isNotExpired = service.isNotExpired(expiredData);
    expect(isNotExpired).toBe(false);
  });

  it('isNotExpired: property updated set to Now() should be not expired', () => {
    const notExpiredDataWithUpdatedSet = getNewDataObject('owm');
    notExpiredDataWithUpdatedSet.updated = new Date().valueOf();
    const isNotExpired = service.isNotExpired(notExpiredDataWithUpdatedSet);
    expect(isNotExpired).toBe(true);
  });

  it('isNotExpired: list 0 element date/time set to now() in fallback should be not expired', () => {
    const notExpiredData = getNewDataObject('owm');
    notExpiredData.list[0].dt = new Date().valueOf() / 1000;
    const isNotExpired = service.isNotExpired(notExpiredData);
    expect(isNotExpired).toBe(true);
  });
});

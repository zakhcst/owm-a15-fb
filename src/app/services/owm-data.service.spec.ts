import { TestBed, async } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';

import { OwmDataService } from './owm-data.service';
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
  getNewDataObject
} from './testing.services.mocks';

describe('OwmDataService', () => {
  let service: OwmDataService;
  let mockDataService: MockDataService;
  let mockOwmService: MockOwmService;
  let mockCitiesService: MockCitiesService;
  let mockOwmFallbackDataService: MockOwmFallbackDataService;
  let mockErrorsService: MockErrorsService;
  let dataService: DataService;

  beforeEach(async(() => {
    mockOwmService = new MockOwmService();
    mockDataService = new MockDataService();
    mockCitiesService = new MockCitiesService();
    mockOwmFallbackDataService = new MockOwmFallbackDataService();
    mockErrorsService = new MockErrorsService();

    TestBed.configureTestingModule({
      imports: [RequiredModules],
      providers: [
        {
          provide: OwmService,
          useValue: mockOwmService
        },
        {
          provide: DataService,
          useValue: mockDataService
        },
        {
          provide: CitiesService,
          useValue: mockCitiesService
        },
        {
          provide: OwmFallbackDataService,
          useValue: mockOwmFallbackDataService
        },
        {
          provide: ErrorsService,
          useValue: mockErrorsService
        }
      ]
    });
    service = TestBed.get(OwmDataService);
    dataService = TestBed.get(DataService);
  }));

  it('should be created', async(() => {
    expect(service).toBeTruthy();
    expect(dataService).toBeTruthy();
  }));

  // it('getData: should return data with new listByDate and reads++', (done: DoneFn) => {
  it('getData: should return data with new listByDate and reads++', async(() => {
    const reads = mockCitiesService.reads;
    mockDataService.dbData = null;
    service.getData('citiId').subscribe(
      _ => {
        expect(mockCitiesService.reads).toBe(reads + 1);
        expect(mockDataService.dbData.updated).toBeTruthy();
        expect(mockDataService.dbData.listByDate).toEqual(
          getNewDataObject().listByDate
        );
        // done();
      },
      error => fail(error)
    );
  }));

  // it('getData: should return new data when expired', (done: DoneFn) => {
  it('getData: should return new data when expired', async(() => {
    const reads = mockCitiesService.reads;
    mockErrorsService.messages = [];
    const spyDataServiceGetData = spyOn(
      mockDataService,
      'getData'
    ).and.callThrough();
    const spyFallBackDataServiceGetData = spyOn(
      mockOwmFallbackDataService,
      'getData'
    ).and.callThrough();

    service.getData('citiId').subscribe(
      responseData => {
        expect(mockCitiesService.reads).toBe(reads + 1);
        expect(mockErrorsService.messages.length).toBe(0);
        expect(spyDataServiceGetData).toHaveBeenCalledTimes(1);
        expect(spyFallBackDataServiceGetData).toHaveBeenCalledTimes(0);
        expect(responseData).toEqual(getNewDataObject());
        // done();
      },
      error => fail(error)
    );
  }));

  // it('getData: should return _owmFallback data when _cities.updateReads fails', (done: DoneFn) => {
  it('getData: should return _owmFallback data when _cities.updateReads fails', async(() => {
    const reads = mockCitiesService.reads;
    mockErrorsService.messages = [];
    const spyFallBackDataServiceGetData = spyOn(
      mockOwmFallbackDataService,
      'getData'
    ).and.callThrough();
    const spyDataServiceGetData = spyOn(
      mockDataService,
      'getData'
    ).and.callThrough();
    service.getData(null).subscribe(
      responseData => {
        expect(mockCitiesService.reads).toBe(reads);
        expect(mockErrorsService.messages.length).toBe(1);
        expect(spyDataServiceGetData).toHaveBeenCalledTimes(0);
        expect(spyFallBackDataServiceGetData).toHaveBeenCalledTimes(1);
        expect(responseData).toEqual(getNewDataObject('owm'));
        // done();
      },
      error => fail(error)
    );
  }));

  // it('requestNewOwmData: should requestNewOwmData', (done: DoneFn) => {
  it('requestNewOwmData: should requestNewOwmData', async(() => {
    mockDataService.dbData = null;
    service.requestNewOwmData('citiId').subscribe(
      _ => {
        expect(mockDataService.dbData.updated).toBeTruthy();
        expect(mockDataService.dbData.listByDate).toEqual(
          getNewDataObject().listByDate
        );
        // done();
      },
      error => fail(error)
    );
  }));

  // it('requestNewOwmData: should fail requestNewOwmData when no cityId is supplied', (done: DoneFn) => {
  it('requestNewOwmData: should fail requestNewOwmData when no cityId is supplied', async(() => {
    mockDataService.dbData = null;
    service.requestNewOwmData(null).subscribe(
      _ => {
        expect(mockDataService.dbData).toBeFalsy();
        fail('should have failed');
        // done();
      },
      error => {
        expect(mockDataService.dbData).toBeFalsy();
        // done();
      }
    );
  }));

  it('setListByDate: should set listByDate', () => {
    expect(
      service.setListByDate(getNewDataObject('owm')).listByDate
    ).toBeTruthy();
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

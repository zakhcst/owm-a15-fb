import { TestBed, waitForAsync } from '@angular/core/testing';

import { OwmDataManagerService } from './owm-data-manager.service';
import { OwmService } from './owm.service';
import { DbOwmService } from './db-owm.service';
import { CitiesService } from './cities.service';
import { ErrorsService } from './errors.service';

import {
  MockDbOwmService,
  MockOwmService,
  MockCitiesService,
  MockErrorsService,
  getNewDataObject,
  MockStatsUpdateService,
} from './testing.services.mocks';
import { SnackbarService } from './snackbar.service';
import { NgxsModule, Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { StatsService } from './stats.service';
import { StatsUpdateService } from './stats-update-dbrequests.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('OwmDataManagerService', () => {
  let service: OwmDataManagerService;
  let mockDbOwmService: MockDbOwmService;
  let mockOwmService: MockOwmService;
  let mockCitiesService: MockCitiesService;
  let mockStatsUpdateService: MockStatsUpdateService;
  let mockErrorsService: MockErrorsService;
  let store: Store;
  let snackbarService: SnackbarService;
  beforeEach(
    waitForAsync(() => {
      mockOwmService = new MockOwmService();
      mockDbOwmService = new MockDbOwmService();
      mockCitiesService = new MockCitiesService();
      mockStatsUpdateService = new MockStatsUpdateService();
      mockErrorsService = new MockErrorsService();

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([]), MatSnackBarModule, BrowserAnimationsModule],
        declarations: [],
        providers: [
          {
            provide: OwmService,
            useValue: mockOwmService,
          },
          {
            provide: DbOwmService,
            useValue: mockDbOwmService,
          },
          {
            provide: CitiesService,
            useValue: mockCitiesService,
          },
          {
            provide: StatsUpdateService,
            useValue: mockStatsUpdateService,
          },
          {  
            provide: ErrorsService,
            useValue: mockErrorsService,
          },
          SnackbarService,
          Store,
        ],
      });
      store = TestBed.inject(Store);
      snackbarService = TestBed.inject(SnackbarService);
      service = TestBed.inject(OwmDataManagerService);
    })
  );

  it(
    'should be created',
    waitForAsync(() => {
      expect(service).toBeDefined();
    })
  );

  it(
    'getDataMemory: should return null when data from store is existing and not expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data now from store' };
      lastDataFromStore.list[0].dt = timeNow;
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory('123456').subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual(null);
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataMemory: should return data from db when no data in store',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory('123456').subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataMemory: should return data from db when data in store is expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory('123456').subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return null when no db connecton',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const spyOnConnected = spyOn(store, 'selectSnapshot').and.returnValues(false, true, '123456');
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnConnected).toHaveBeenCalledTimes(3);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(0);
          expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(0);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(0);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual(null);
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return null when not connected',
    waitForAsync(() => {
      const cityId = null;
      
      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(responseData).toEqual(null);
        },
        (error) => fail(error)
      );
    })
  );
  
  it(
    'getDataDB: should return null when connected && livedata && cityid != null and i/o error',
    waitForAsync(() => {
      const errMessage = 'I/O error';
      const cityId = '#cityId';
      const owmData = getNewDataObject();
      const spyOnConnected = spyOn(store, 'selectSnapshot').and.returnValues(true, true, '#cityId');
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyGetDataServiceOrTimeout = spyOn(service, 'getDataServiceOrTimeout').and.returnValue(throwError(new Error(errMessage)));
      const spyAddErrors = spyOn(service, 'addError');

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnConnected).toHaveBeenCalledTimes(3);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(1);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(0);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(0);
          expect(spyGetDataServiceOrTimeout).toHaveBeenCalledTimes(1);
          expect(spyAddErrors).toHaveBeenCalledWith(new Error(errMessage));
          expect(responseData).toEqual(null);
        },
        (error) => fail(error)
      );
    })
  );
  it(
    'getDataDB: should return owm data when connected && livedata && cityid = null',
    waitForAsync(() => {
      const cityId = null;
      const owmData = getNewDataObject();
      const spyOnConnected = spyOn(store, 'selectSnapshot').and.returnValues(true, true, '#cityId');
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnConnected).toHaveBeenCalledTimes(3);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(0);
          expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(0);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(0);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'fresh from owm' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return db data when db and not expired',
    waitForAsync(() => {
      const cityId = '#cityId';
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(true, false);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const timeNow = new Date().valueOf() / 1000;
      const dataNow = { ...owmData, cod: 'data now from db' };
      dataNow.list[0].dt = timeNow;
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(of(dataNow));
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(3);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(1);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual({ ...owmData, cod: 'data now from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return fresh owm data when db has expired',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(true, false, '123456');
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(3);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(1);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'fresh from owm' });
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

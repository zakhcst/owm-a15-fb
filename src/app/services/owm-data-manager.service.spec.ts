import { TestBed, waitForAsync } from '@angular/core/testing';

import { OwmDataManagerService } from './owm-data-manager.service';
import { OwmService } from './owm.service';
import { DbOwmService } from './db-owm.service';
import { CitiesService } from './cities.service';
import { ErrorsService } from './errors.service';
import { OwmDataUtilsService } from './owm-data-utils.service';

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
  let utils: OwmDataUtilsService;

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
          OwmDataUtilsService
        ],
      });
      store = TestBed.inject(Store);
      snackbarService = TestBed.inject(SnackbarService);
      service = TestBed.inject(OwmDataManagerService);
      utils = TestBed.inject(OwmDataUtilsService);
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
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
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
    'getDataMemory: should return null when data from store is existing and not expired(isolated)',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data now from store' };
      lastDataFromStore.list[0].dt = timeNow;
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.returnValue(true);
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
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
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(null);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
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
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
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
    'getDataMemory: should return data from db when data in store is expired(isolated)',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.returnValue(false);
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
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
    'getDataDB: should return null when connected && livedata && cityId is not previousCityId and i/o error',
    waitForAsync(() => {
      const errMessage = 'I/O error';
      const owmData = getNewDataObject();
      const spyOnLiveUpdate = spyOn(store, 'selectSnapshot').and.returnValues(true);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyGetDataServiceOrTimeout = spyOn(utils, 'getDataServiceOrTimeout').and.returnValue(throwError(new Error(errMessage)));
      const spyAddErrors = spyOn(service, 'addError');

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '654321' }).subscribe(
        (responseData) => {
          expect(spyOnLiveUpdate).toHaveBeenCalledTimes(1);
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
    'getDataDB: should return OWM data when connected && livedata && cityId is previousCityId',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnLiveUpdate = spyOn(store, 'selectSnapshot').and.returnValues(true);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLiveUpdate).toHaveBeenCalledTimes(1);
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
    'getDataDB: should return db data when db data not expired and liveUpdate is false',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(false);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const timeNow = new Date().valueOf() / 1000;
      const dataNow = { ...owmData, cod: 'data now from db' };
      dataNow.list[0].dt = timeNow;
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(of(dataNow));
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(1);
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
    'getDataDB: should return db data when db data not expired and liveUpdate is true and city change',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(false);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const timeNow = new Date().valueOf() / 1000;
      const dataNow = { ...owmData, cod: 'data now from db' };
      dataNow.list[0].dt = timeNow;
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(of(dataNow));
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '564321' }).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(1);
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
    'getDataDB: should return null when db data is not expired and liveUpdate is true',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(true);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const timeNow = new Date().valueOf() / 1000;
      const dataNow = { ...owmData, cod: 'data now from db' };
      dataNow.list[0].dt = timeNow;
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(of(dataNow));
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.returnValue(true);

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '654321' }).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(1);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual(null);
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
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(false);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(1);
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

});

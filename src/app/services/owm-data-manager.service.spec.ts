import { fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { StatsUpdateService } from './stats-update-dbrequests.service';
import { TestScheduler } from 'rxjs/testing';

import { OwmDataManagerService } from './owm-data-manager.service';
import { OwmService } from './owm.service';
import { DbOwmService } from './db-owm.service';
import { ErrorsService } from './errors.service';
import { OwmDataUtilsService } from './owm-data-utils.service';
import {
  MockDbOwmService,
  MockOwmService,
  MockErrorsService,
  getNewDataObject,
  MockStatsUpdateService,
} from './testing.services.mocks';
import { HistoryLogService } from './history-log.service';

describe('OwmDataManagerService', () => {
  let service: OwmDataManagerService;
  let mockDbOwmService: MockDbOwmService;
  let mockOwmService: MockOwmService;
  let mockStatsUpdateService: MockStatsUpdateService;
  let mockErrorsService: MockErrorsService;
  let store: Store;
  let utils: OwmDataUtilsService;
  let testScheduler;

  beforeEach(
    waitForAsync(() => {
      mockOwmService = new MockOwmService();
      mockDbOwmService = new MockDbOwmService();
      mockStatsUpdateService = new MockStatsUpdateService();
      mockErrorsService = new MockErrorsService();
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([])],
        declarations: [],
        providers: [
          Store,
          {
            provide: OwmService,
            useValue: mockOwmService,
          },
          {
            provide: DbOwmService,
            useValue: mockDbOwmService,
          },
          {
            provide: StatsUpdateService,
            useValue: mockStatsUpdateService,
          },
          {
            provide: ErrorsService,
            useValue: mockErrorsService,
          },
          {
            provide: HistoryLogService,
            useValue: { setDataToFB: function (ip, newEntry) { } }
          },
          OwmDataUtilsService
        ],
      });
      store = TestBed.inject(Store);
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
    'should getDataMemory return null when data from store is existing and not expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data now from store' };
      lastDataFromStore.list[0].dt = timeNow;
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual(null);
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'should getDataMemory return null when data from store is existing and not expired(isolated)',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data now from store' };
      lastDataFromStore.list[0].dt = timeNow;
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.returnValue(true);
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual(null);
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'should getDataMemory return data from db when no data in store',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(null);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'should getDataMemory return data from db when data in store is expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'should getDataMemory return data from db when data in store is expired(isolated)',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.returnValue(false);
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemory({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'should getDataDB return null when connected && livedata && cityId is not previousCityId and i/o error',
    waitForAsync(() => {
      const errMessage = 'I/O error';
      const owmData = getNewDataObject();
      const spyOnLiveUpdate = spyOn(store, 'selectSnapshot').and.returnValues(true);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
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
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
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
    'should getDataDB return OWM data when connected && livedata && cityId is previousCityId',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnLiveUpdate = spyOn(store, 'selectSnapshot').and.returnValues(true);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnLiveUpdate).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(0);
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
    'should getDataDB return db data when db data not expired and liveUpdate is false',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(false);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
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
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
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
    'should getDataDB return db data when db data not expired and liveUpdate is true and city change',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(false);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
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
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
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
    'should getDataDB return null when db data is not expired and liveUpdate is true',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(true);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
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
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
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
    'should getDataDB return fresh owm data when db has expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValues(false);
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnIsNotExpired = spyOn(utils, 'isNotExpired').and.callThrough();

      service.getDataDB({ selectedCityId: '123456', previousSelectedCityId: '123456' }).subscribe(
        (responseData) => {
          expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(1);
          expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
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

  it('should updateStatsDBRequests', () => {
    const spyOnMockStatsUpdateService = spyOn(mockStatsUpdateService, 'updateStatsDBRequests');
    service.updateStatsDBRequests('cityId');
    expect(spyOnMockStatsUpdateService).toHaveBeenCalledTimes(1);
  });

  it('should addError', () => {
    const spyOnMockErrorsService = spyOn(mockErrorsService, 'add');
    service.addError('error message');
    expect(spyOnMockErrorsService).toHaveBeenCalledTimes(1);
  });

  it('should getDataOWM on error', fakeAsync(() => {
    const owmData = getNewDataObject();
    const errMessage = 'error message';
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const spyGetDataServiceOrTimeout = spyOn(utils, 'getDataServiceOrTimeout').and.returnValue(throwError(new Error(errMessage)));
    const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'setData');
    const spyOnMockErrorsService = spyOn(mockErrorsService, 'add');

    service.getDataOWM('cityId').subscribe(data => {
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
      expect(spyGetDataServiceOrTimeout).toHaveBeenCalledTimes(1);
      expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(0);
      expect(spyOnMockErrorsService).toHaveBeenCalledTimes(1);
      expect(data).toBeNull();
    });
  }));

  it('should getDataOWM', fakeAsync(() => {
    const owmData = getNewDataObject();
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const spyGetDataServiceOrTimeout = spyOn(utils, 'getDataServiceOrTimeout').and.returnValue(of(owmData));
    const spyOnMockDbOwmService = spyOn(mockDbOwmService, 'setData');
    const spyOnMockErrorsService = spyOn(mockErrorsService, 'add');

    service.getDataOWM('cityId').subscribe(data => {
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
      expect(spyGetDataServiceOrTimeout).toHaveBeenCalledTimes(1);
      expect(spyOnMockDbOwmService).toHaveBeenCalledTimes(1);
      expect(spyOnMockErrorsService).toHaveBeenCalledTimes(0);
      expect(data).toBe(owmData);
    });
  }));

  it('should combineLatestStatus wait when connected false', () => {
    const owmData = getNewDataObject();
    testScheduler.run(({ expectObservable, cold }) => {
      const delay = 100;
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnGetDataMemory = spyOn(service, 'getDataMemory').and.returnValue(of(owmData));

      const cityId$ = cold(`a ${delay}ms b`, { a: 'cityId1', b: 'cityid1' });
      const spyOnSelectedCityId$ = spyOnProperty(service, 'selectedCityId$').and.returnValue(cityId$);

      const connected$ = cold(`a ${delay}ms b`, { a: false, b: false });
      const spyOnConnected$ = spyOnProperty(service, 'connected$').and.returnValue(connected$);

      const away$ = cold(`a ${delay}ms b`, { a: false, b: false });
      const spyOnAway$ = spyOnProperty(service, 'away$').and.returnValue(away$);

      const expected = '--';
      expectObservable(service.combineLatestStatus()).toBe(expected, { d: owmData });
    });
  });

  it('should combineLatestStatus wait when away true', () => {
    const owmData = getNewDataObject();
    testScheduler.run(({ expectObservable, cold }) => {
      const delay = 100;
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnGetDataMemory = spyOn(service, 'getDataMemory').and.returnValue(of(owmData));

      const cityId$ = cold(`a ${delay}ms b`, { a: 'cityId1', b: 'cityid1' });
      const spyOnSelectedCityId$ = spyOnProperty(service, 'selectedCityId$').and.returnValue(cityId$);

      const connected$ = cold(`a ${delay}ms b`, { a: true, b: true });
      const spyOnConnected$ = spyOnProperty(service, 'connected$').and.returnValue(connected$);

      const away$ = cold(`a ${delay}ms b`, { a: true, b: true });
      const spyOnAway$ = spyOnProperty(service, 'away$').and.returnValue(away$);

      const expected = '--';
      expectObservable(service.combineLatestStatus()).toBe(expected, { d: owmData });
    });
  });

  it('should combineLatestStatus return data once when connected true and away false', () => {
    const owmData = getNewDataObject();
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnGetDataMemory = spyOn(service, 'getDataMemory').and.returnValue(of(owmData));
      const spyOnSetOwmDataCache = spyOn(service['_utils'], 'setOwmDataCache').and.returnValue(of());
      const cityId$ = cold('c', { c: 'cityId1' });
      const spyOnSelectedCityId$ = spyOnProperty(service, 'selectedCityId$').and.returnValue(cityId$);
      const connected$ = cold('t', { t: true });
      const spyOnConnected$ = spyOnProperty(service, 'connected$').and.returnValue(connected$);
      const away$ = cold('f', { f: false });
      const spyOnAway$ = spyOnProperty(service, 'away$').and.returnValue(away$);

      expectObservable(service.combineLatestStatus());
      flush();
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
      expect(spyOnSetOwmDataCache).toHaveBeenCalledTimes(1);
    });
  });

  it('should combineLatestStatus return data when connected and away change sequentially', () => {
    const owmData = getNewDataObject();
    testScheduler.run(({ expectObservable, cold, flush }) => {
      const delay = 100;
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnGetDataMemory = spyOn(service, 'getDataMemory').and.returnValue(of(owmData));
      const spyOnSetOwmDataCache = spyOn(service['_utils'], 'setOwmDataCache').and.returnValue(of());
      const cityId$ = cold('c', { c: 'cityId1' });
      const spyOnSelectedCityId$ = spyOnProperty(service, 'selectedCityId$').and.returnValue(cityId$);
      const connected$ = cold(`t ${delay}ms f ${delay}ms t`, { t: true, f: false });
      const spyOnConnected$ = spyOnProperty(service, 'connected$').and.returnValue(connected$);
      const away$ = cold(`f ${delay * 3 + 1}ms t ${delay + 1}ms f`, { t: true, f: false });
      const spyOnAway$ = spyOnProperty(service, 'away$').and.returnValue(away$);

      const expected = `d ${delay * 2 + 1}ms d ${delay * 2 + 1}ms d`;
      expectObservable(service.combineLatestStatus());
      flush();
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(6);
    });
  });

  it('should subscribeOnStatusChange', waitForAsync(() => {
    const spyOnCombineLatestStatus = spyOn(service, 'combineLatestStatus').and.returnValue(of());
    service.subscribeOnStatusChange();
    expect(spyOnCombineLatestStatus).toHaveBeenCalledTimes(1);

  }));

});

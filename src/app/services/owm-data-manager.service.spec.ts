import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

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
  MockOwmStatsService,
} from './testing.services.mocks';
import { SnackbarService } from './snackbar.service';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { StatsService } from './stats.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SetDataState } from '../states/app.actions';
import { cold, getTestScheduler } from 'jasmine-marbles';

fdescribe('OwmDataManagerService', () => {
  let service: OwmDataManagerService;
  let mockDataService: MockDataService;
  let mockOwmService: MockOwmService;
  let mockCitiesService: MockCitiesService;
  let mockOwmStatsService: MockOwmStatsService;
  let mockOwmFallbackDataService: MockOwmFallbackDataService;
  let mockErrorsService: MockErrorsService;
  let dataService: DataService;
  let store: Store;
  let snackbarService: SnackbarService;
  beforeEach(
    waitForAsync(() => {
      mockOwmService = new MockOwmService();
      mockDataService = new MockDataService();
      mockCitiesService = new MockCitiesService();
      mockOwmStatsService = new MockOwmStatsService();
      mockOwmFallbackDataService = new MockOwmFallbackDataService();
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
            provide: DataService,
            useValue: mockDataService,
          },
          {
            provide: CitiesService,
            useValue: mockCitiesService,
          },
          {
            provide: StatsService,
            useValue: mockOwmStatsService,
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
          Store,
        ],
      });
      dataService = TestBed.inject(DataService);
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
    'getDataMemoryOnAway: should return null when data from store is existing and not expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data now from store' };
      lastDataFromStore.list[0].dt = timeNow;
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnAway().subscribe(
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
    'getDataMemoryOnAway: should return data from db when no data in store',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnAway().subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(2);
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
    'getDataMemoryOnAway: should return data from db when data in store is expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnAway().subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(2);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it('subscribeAway: should call dispatch set data on away$ emits false', fakeAsync(() => {
    const owmData = getNewDataObject();
    service.getDataOnCityChangeInProgress = false;
    service.getDataOnConnectedInProgress = false;
    const spyOnGetDataMemoryOnAway = spyOn(service, 'getDataMemoryOnAway').and.callFake(() =>
      of({ ...owmData, cod: 'test' })
    );
    const spyOnDispatch = spyOn(store, 'dispatch').and.callFake(() => of(true));
    const q$ = cold('-t-f|', { t: true, f: false });
    const spyOnSelect = spyOnProperty(service, 'away$').and.returnValue(q$);

    service.subscribeAway();
    getTestScheduler().flush();
    tick(20);
    expect(spyOnGetDataMemoryOnAway).toHaveBeenCalledTimes(1);
    expect(spyOnDispatch).toHaveBeenCalledTimes(1);
    expect(spyOnDispatch).toHaveBeenCalledWith(new SetDataState({ ...owmData, cod: 'test' }));
  }));
  
  fit('subscribeAway: should wait when away$ emits true', fakeAsync(() => {
    const owmData = getNewDataObject();
    service.getDataOnCityChangeInProgress = false;
    service.getDataOnConnectedInProgress = false;
    const spyOnGetDataMemoryOnAway = spyOn(service, 'getDataMemoryOnAway').and.callFake(() =>
      of({ ...owmData, cod: 'test' })
    );
    const spyOnDispatch = spyOn(store, 'dispatch').and.callFake(() => of(true));
    const q$ = cold('-t--|', { t: true, f: false });
    const spyOnSelect = spyOnProperty(service, 'away$').and.returnValue(q$);

    service.subscribeAway();
    getTestScheduler().flush();
    tick(20);
    expect(spyOnGetDataMemoryOnAway).toHaveBeenCalledTimes(0);
    expect(spyOnDispatch).toHaveBeenCalledTimes(0);
  }));

  it(
    'getDataMemoryOnConnected: should return null when data from store is existing and not expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data now from store' };
      lastDataFromStore.list[0].dt = timeNow;
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnConnected().subscribe(
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
    'getDataMemoryOnConnected: should return data from db when no data in store',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnConnected().subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(2);
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
    'getDataMemoryOnConnected: should return data from db when data in store is expired',
    waitForAsync(() => {
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data from store' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnConnected().subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(2);
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
    'getDataMemoryOnCityChange: should return data from db when data in store is expired',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const timeNow = new Date().valueOf() / 1000;
      const lastDataFromStore = { ...owmData, cod: 'data from store not expired' };
      lastDataFromStore.list[0].dt = timeNow;

      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnCityChange(cityId).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataDB).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual({ ...owmData, cod: 'data from store not expired' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataMemoryOnCityChange: should return data from db when data in store is expired',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const lastDataFromStore = { ...owmData, cod: 'data now from store expired' };
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(lastDataFromStore);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataDB = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnCityChange(cityId).subscribe(
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
    'getDataMemoryOnCityChange: should return data from db when no city data in store',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const spyOnLastData = spyOn(store, 'selectSnapshot').and.returnValue(null);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();
      const spyOnGetDataOwm = spyOn(service, 'getDataDB').and.returnValue(of({ ...owmData, cod: 'data from db' }));

      service.getDataMemoryOnCityChange(cityId).subscribe(
        (responseData) => {
          expect(spyOnLastData).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'data from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return fallback when no db connecton',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const spyOnConnected = spyOn(store, 'selectSnapshot').and.returnValue(false);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDataService = spyOn(mockDataService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnFallBackDataServiceGetData = spyOn(service, 'getFallbackData').and.returnValue(
        of({ ...owmData, cod: 'fallback' })
      );
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnConnected).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(0);
          expect(spyOnMockDataService).toHaveBeenCalledTimes(0);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(0);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(0);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(0);
          expect(spyOnFallBackDataServiceGetData).toHaveBeenCalledTimes(1);
          expect(responseData).toEqual({ ...owmData, cod: 'fallback' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return db data when existing and not expired',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const spyOnConnected = spyOn(store, 'selectSnapshot').and.returnValue(true);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const timeNow = new Date().valueOf() / 1000;
      const dataNow = { ...owmData, cod: 'data now from db' };
      dataNow.list[0].dt = timeNow;
      const spyOnMockDataService = spyOn(mockDataService, 'getData').and.returnValue(of(dataNow));
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnFallBackDataServiceGetData = spyOn(service, 'getFallbackData').and.returnValue(
        of({ ...owmData, cod: 'fallback' })
      );
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnConnected).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnMockDataService).toHaveBeenCalledTimes(1);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(0);
          expect(spyOnFallBackDataServiceGetData).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual({ ...owmData, cod: 'data now from db' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'getDataDB: should return new data when existing has expired',
    waitForAsync(() => {
      const cityId = 'cityId';
      const owmData = getNewDataObject();
      const spyOnConnected = spyOn(store, 'selectSnapshot').and.returnValue(true);
      const spyOnSnackbarShow = spyOn(snackbarService, 'show').and.callFake(() => {});
      const spyOnMockDataService = spyOn(mockDataService, 'getData').and.returnValue(
        of({ ...owmData, cod: 'expired from db' })
      );
      const spyOnUpdateStatsDBRequests = spyOn(service, 'updateStatsDBRequests').and.returnValue(null);
      const spyOnGetDataOwm = spyOn(service, 'getDataOWM').and.returnValue(of({ ...owmData, cod: 'fresh from owm' }));
      const spyOnFallBackDataServiceGetData = spyOn(service, 'getFallbackData').and.returnValue(
        of({ ...owmData, cod: 'fallback' })
      );
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.callThrough();

      service.getDataDB(cityId).subscribe(
        (responseData) => {
          expect(spyOnConnected).toHaveBeenCalledTimes(1);
          expect(spyOnSnackbarShow).toHaveBeenCalledTimes(1);
          expect(spyOnMockDataService).toHaveBeenCalledTimes(1);
          expect(spyOnUpdateStatsDBRequests).toHaveBeenCalledTimes(1);
          expect(spyOnIsNotExpired).toHaveBeenCalledTimes(1);
          expect(spyOnGetDataOwm).toHaveBeenCalledTimes(1);
          expect(spyOnFallBackDataServiceGetData).toHaveBeenCalledTimes(0);
          expect(responseData).toEqual({ ...owmData, cod: 'fresh from owm' });
        },
        (error) => fail(error)
      );
    })
  );

  it(
    'requestNewOwmData: should requestNewOwmData',
    waitForAsync(() => {
      mockDataService.dbData = null;
      service.getDataOWM('citiId').subscribe(
        (responseData) => {
          delete responseData.updated;
          expect(responseData).toEqual(getNewDataObject());
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

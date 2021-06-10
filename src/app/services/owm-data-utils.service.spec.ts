import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { ConstantsService } from './constants.service';
import { HistoryLogService } from './history-log.service';

import { OwmDataUtilsService } from './owm-data-utils.service';
import { getNewDataObject } from './testing.services.mocks';

describe('OwmDataUtilsService', () => {

  let service: OwmDataUtilsService;
  let store: Store;
  let testScheduler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])],
      providers: [
        Store,
        { provide: HistoryLogService, useValue: { setDataToFB: function (ip, newEntry) { } } }
      ]
    });
    service = TestBed.inject(OwmDataUtilsService);
    store = TestBed.inject(Store);
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should set listByDate in setListByDate', () => {
    expect(service.setListByDate(getNewDataObject('owm')).listByDate).toBeTruthy();
  });

  it('should isNotExpired return false for fallback/sample data', () => {
    const expiredData = getNewDataObject('owm');
    const isNotExpired = service.isNotExpired(expiredData);
    expect(isNotExpired).toBe(false);
  });

  it('should isNotExpired return true when property updated is set to Date.now()', () => {
    const notExpiredDataWithUpdatedSet = getNewDataObject('owm');
    notExpiredDataWithUpdatedSet.updated = new Date().valueOf();
    const isNotExpired = service.isNotExpired(notExpiredDataWithUpdatedSet);
    expect(isNotExpired).toBe(true);
  });

  it('should isNotExpired return true when list[0].dt set to Date.now()', () => {
    const notExpiredData = getNewDataObject('owm');
    notExpiredData.list[0].dt = new Date().valueOf() / 1000;
    delete notExpiredData.updated;
    const isNotExpired = service.isNotExpired(notExpiredData);
    expect(isNotExpired).toBe(true);
  });

  it('should isNotExpired return true when no list[0].dt ', () => {
    const notExpiredData = getNewDataObject('owm');
    delete notExpiredData.list[0].dt;
    delete notExpiredData.updated;
    const isNotExpired = service.isNotExpired(notExpiredData);
    expect(isNotExpired).toBe(false);
  });

  it('should getDataServiceOrTimeout data when return before timeout period', (done) => {
    const data = getNewDataObject('owm');
    const serviceToCall = of(data);
    service.getDataServiceOrTimeout(serviceToCall).subscribe(responseData => {
      expect(responseData).toBe(data);
      done();
    });
  });

  it('should getDataServiceOrTimeout throw error when data is not returned in timeout period', fakeAsync(() => {
    const data = getNewDataObject('owm');
    const serviceToCall = of(data).pipe(delay(ConstantsService.dataResponseTimeout_ms * 2 + 1));

    service.getDataServiceOrTimeout(serviceToCall).subscribe(responseData => {
      fail('should time out with error');
    },
      error => {
        expect(error).toBe('Service Timeout Error');
      });
    tick(ConstantsService.dataResponseTimeout_ms * 2);
  }));

  it('should getOwmDataDebounced$ when showLoading is true', fakeAsync(() => {
    const data = getNewDataObject('owm');
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue(of(data));

    const showLoading = true;
    service.getOwmDataDebounced$({ showLoading }).subscribe((responseData) => {
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
      expect(responseData).toBe(data);
    });
  }));

  it('should getOwmDataDebounced$ when showLoading is false', fakeAsync(() => {
    const data = getNewDataObject('owm');
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue(of(data));

    const showLoading = false;
    service.getOwmDataDebounced$({ showLoading }).subscribe((responseData) => {
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(0);
      expect(responseData).toBe(data);
    });
  }));

  it('should getOwmDataDebounced$ when no data', fakeAsync(() => {
    const data = getNewDataObject('owm');
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue(of(null));

    const showLoading = true;
    service.getOwmDataDebounced$({ showLoading }).subscribe((responseData) => fail());
    tick(10000);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(0);
  }));

  it('should getOwmDataDebounced$ when data expired', fakeAsync(() => {
    const data = getNewDataObject('owm');
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const a = { ...data, updated: 1 };
    const b = { ...data, updated: 2 };
    const c = { ...data, updated: 3 };
    const $q = cold('--a--b--c--|', { a, b, c });
    const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue($q);

    const showLoading = true;
    service.getOwmDataDebounced$({ showLoading }).subscribe((responseData) => {
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(4);
      expect(responseData).toBe(c);
    });
  }));

  it('should getOwmDataDebounced$ when data is different and is expired', () => {

    testScheduler.run(({ expectObservable, cold }) => {
      const showLoading = true;
      const data = getNewDataObject('owm');
      const debounce_ms = ConstantsService.loadingDataDebounceTime_ms;
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.returnValue(false);
      const a = { ...data, updated: 1 };
      const b = { ...data, updated: 2 };
      const c = { ...data, updated: 3 };
      const delayed = 100;
      const $q = cold(`${delayed}ms a ${delayed}ms b ${delayed}ms c`, { a, b, c });
      const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue($q);
      const expected = `${debounce_ms + delayed * 3 + 2}ms c `;
      expectObservable(service.getOwmDataDebounced$({ showLoading })).toBe(expected, { c });
    });

  });

  it('should getOwmDataDebounced$ when data is duplicated and is different and is expired', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const showLoading = true;
      const data = getNewDataObject('owm');
      const debounce_ms = ConstantsService.loadingDataDebounceTime_ms;
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.returnValue(false);
      const a = { ...data, updated: 1 };
      const b = { ...data, updated: 3 };
      const c = { ...data, updated: 3 };
      const delayed = 100;
      const $q = cold(`${delayed}ms a ${delayed}ms b ${delayed}ms c`, { a, b, c });
      const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue($q);
      const expected = `${debounce_ms + delayed * 2 + 1}ms c `;
      expectObservable(service.getOwmDataDebounced$({ showLoading })).toBe(expected, { c });
    });
  });

  it('should getOwmDataDebounced$ when data is duplicated and is different and is not expired', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const showLoading = true;
      const data = getNewDataObject('owm');
      const debounce_ms = ConstantsService.loadingDataDebounceTime_ms;
      const spyOnStoreDispatch = spyOn(store, 'dispatch');
      const spyOnIsNotExpired = spyOn(service, 'isNotExpired').and.returnValue(true);
      const a = { ...data, updated: 1 };
      const b = { ...data, updated: 1 };
      const c = { ...data, updated: Date.now() };
      const delayed = 100;
      const $q = cold(`${delayed}ms a ${delayed}ms b ${delayed}ms c`, { a, b, c });
      const spyOnSelectedCityOwmDataCache$ = spyOnProperty(service, 'selectedCityOwmDataCache$').and.returnValue($q);
      const expected = `${delayed}ms a ${delayed * 2 + 1}ms c `;
      expectObservable(service.getOwmDataDebounced$({ showLoading })).toBe(expected, { a, c });
    });
  });

  it('should getWeatherDefaultBgImg', () => {
    expect(service.getWeatherDefaultBgImg()).toBe(ConstantsService.weatherBgImgPath + ConstantsService.weatherDefaultBgImgFileName);
  });

  it('should getWeatherBgImg', () => {
    const data = getNewDataObject();
    const dataFirstDayKey = Object.keys(data.listByDate)[0];
    const dataFirstDayFirstHourKey = Object.keys(data.listByDate[dataFirstDayKey])[0];
    const dataFirstDayFirstHourSlot = data.listByDate[dataFirstDayKey][dataFirstDayFirstHourKey];
    const weatherBgImgUrl = service.getWeatherBgImg(dataFirstDayFirstHourSlot);
    const dataFirstDayFirstHourSlotBg = dataFirstDayFirstHourSlot.weather[0].main.toLocaleLowerCase();
    const syspod = dataFirstDayFirstHourSlot.sys.pod;
    const dataFirstDayFirstHourSlotBg_syspod = dataFirstDayFirstHourSlotBg + '_' + syspod;
    expect(weatherBgImgUrl).toContain(dataFirstDayFirstHourSlotBg_syspod);
  });

  it('should getWeatherBgImg when no syspod', () => {
    const data = getNewDataObject();
    const dataFirstDayKey = Object.keys(data.listByDate)[0];
    const dataFirstDayFirstHourKey = Object.keys(data.listByDate[dataFirstDayKey])[0];
    const dataFirstDayFirstHourSlot = data.listByDate[dataFirstDayKey][dataFirstDayFirstHourKey];
    const dataFirstDayFirstHourSlotBg = dataFirstDayFirstHourSlot.weather[0].main.toLocaleLowerCase();
    const defaultUrl = service.getWeatherDefaultBgImg();

    dataFirstDayFirstHourSlot.sys.pod = 'x';
    let getWeatherBgImgUrl = service.getWeatherBgImg(dataFirstDayFirstHourSlot);
    expect(getWeatherBgImgUrl).toContain(defaultUrl);

    delete dataFirstDayFirstHourSlot.sys.pod;
    getWeatherBgImgUrl = service.getWeatherBgImg(dataFirstDayFirstHourSlot);
    expect(getWeatherBgImgUrl).toContain(defaultUrl);
  });

  it('should setOwmDataCache return when no owm', () => {
    const spyOnStoreSelectSnapshot = spyOn(store, 'selectSnapshot');
    service.setOwmDataCache(null, true);
    expect(spyOnStoreSelectSnapshot).toHaveBeenCalledTimes(0);
  });

  it('should setOwmDataCache return when owm.updated is undefined', () => {
    const data = getNewDataObject();
    delete data.updated;
    const spyOnStoreSelectSnapshot = spyOn(store, 'selectSnapshot');
    service.setOwmDataCache(data, true);
    expect(spyOnStoreSelectSnapshot).toHaveBeenCalledTimes(0);
  });

  it('should setOwmDataCache return when cached.updated >= owm.updated', () => {
    const data = getNewDataObject();
    const now = Date.now();
    data.updated = now;
    const spyOnStoreSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue({ ...data, updated: now + 100 });
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    service.setOwmDataCache(data, true);
    expect(spyOnStoreSelectSnapshot).toHaveBeenCalledTimes(1);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(0);
  });

  it('should setOwmDataCache when dbLiveUpdateRefresh is false ', waitForAsync(() => {
    const data = getNewDataObject();
    const now = Date.now();
    data.updated = now;
    const spyOnStoreSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue({ ...data, updated: now - 100 });
    const spyOnStoreSelect = spyOnProperty(service, 'selectStatusNormalizedIp$').and.returnValue(of('1-1-1-1'));
    const spyOnStoreDispatch = spyOn(store, 'dispatch').and.returnValue(of(true));
    const spyOn_historyLogSetDataToFB = spyOn(service['_historyLog'], 'setDataToFB').and.resolveTo();

    service.setOwmDataCache(data, false).subscribe(() => {
      expect(spyOnStoreSelectSnapshot).toHaveBeenCalledTimes(1);
      expect(spyOn_historyLogSetDataToFB).toHaveBeenCalledTimes(1);
      expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
      expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
    });
  }));

  it('should setOwmDataCache when dbLiveUpdateRefresh is true', waitForAsync(() => {
    const data = getNewDataObject();
    const now = Date.now();
    data.updated = now;
    const spyOnStoreSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue({ ...data, updated: now - 100 });
    const spyOnStoreSelectStatusNormalizedIp$ = spyOnProperty(service, 'selectStatusNormalizedIp$').and.returnValue(of('1-1-1-1'));
    const spyOnStoreDispatch = spyOn(store, 'dispatch').and.returnValue(of(true));
    const spyOn_historyLogSetDataToFB = spyOn(service['_historyLog'], 'setDataToFB').and.resolveTo();

    service.setOwmDataCache(data, true).subscribe(
      (success) => fail(),
      (error) => fail(),
      () => {
        expect(spyOnStoreSelectSnapshot).toHaveBeenCalledTimes(1);
        expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
        expect(spyOn_historyLogSetDataToFB).toHaveBeenCalledTimes(0);
        expect(spyOnStoreSelectStatusNormalizedIp$).toHaveBeenCalledTimes(0);
      }
    );
  }));
});

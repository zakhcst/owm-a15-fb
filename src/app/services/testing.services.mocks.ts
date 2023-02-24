import { BehaviorSubject, Observable, of, ReplaySubject, Subject, throwError } from 'rxjs';

import { IOwmDataModel } from '../models/owm-data.model';
import { ICities } from '../models/cities.model';
import { AppErrorModel, AppHistoryPayloadModel, HistoryLogModel } from '../states/app.models';

import dataJSON from '../../assets/owm-fallback-data.json';
import citiesJSON from '../../../misc/cities-obj.json';
import { IPopupModel } from '../models/snackbar.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { IHistoryLog } from '../models/history-log.model';
import { ActivatedRoute, Params, RouterEvent } from '@angular/router';

export const data = <IOwmDataModel>(<any>dataJSON);

export const getNewDataObject = (state?: string): IOwmDataModel => {
  const fallbackData: IOwmDataModel = JSON.parse(JSON.stringify(data));
  if (state === 'owm') {
    delete fallbackData.listByDate;
    delete fallbackData.updated;
  }
  return fallbackData;
};

export const cities = <ICities>(<any>citiesJSON);
export const getNewCitiesObject = (): ICities => JSON.parse(JSON.stringify(cities));

export class MockOwmService {
  getData(cityId: string) {
    const owmData = getNewDataObject('owm');
    return cityId ? of(owmData) : throwError(new Error('getData'));
  }
  getDefaultData(cityId: string) {
    const owmData = getNewDataObject('owm');
    return cityId ? of(owmData) : throwError(new Error('getDefaultData'));
  }
}

export class MockDataService {
  error = false;
  dbData: IOwmDataModel;
  getData(cityId: string) {
    this.dbData = getNewDataObject();
    return of(cityId ? this.dbData : null);
  }
  setData(cityId: string, owmData: IOwmDataModel) {
    this.dbData = owmData;
    return owmData && !this.error ? Promise.resolve() : Promise.reject();
  }
}
export class MockDbOwmService {
  dbData: IOwmDataModel;
  getData(cityId: string) {
    this.dbData = getNewDataObject();
    return cityId ? of(this.dbData) : throwError(new Error('MockDbOwmService:getData'));
  }
  setData(data: IOwmDataModel) {
    this.dbData = data;
  }

  getOwmDataDebounced$({ showLoading }) {
    this.dbData = getNewDataObject();
    return of(this.dbData);
  }
}

export class MockCitiesService {
  reads = 0;
  getData() {
    const lsError = localStorage.getItem('mockCitiesServiceError');
    return lsError ? throwError(new Error('MockCitiesService:getData')) : of(getNewCitiesObject());
  }

  updateReads(cityId: string) {
    const lsError = localStorage.getItem('mockCitiesServiceError');
    this.reads = cityId && !lsError ? this.reads || 0 + 1 : this.reads;
    return cityId && !lsError ? of(null) : throwError(new Error('MockCitiesService:updateReads'));
  }
}

export class MockOwmStatsService {
  getData(error?: any) {
    const sample = { r: 100, u: 100 };
    const lsError = localStorage.getItem('mockOwmStatsServiceError');
    const stats = JSON.parse(localStorage.getItem('mockOwmStatsService'));
    return error || lsError ? throwError(new Error('MockOwmStatsService:getData')) : of(stats || sample);
  }
}
export class MockStatsUpdateService {
  updateStatsDBRequests(cityId) {
    return cityId === 'Error' ? throwError(new Error('MockOwmStatsService:getData')) : undefined;
  }
}
export class MockGetBrowserIpService {
  ipSample = '1.1.1.1';
  getIP() {
    const lsError = localStorage.getItem('mockGetBrowserIpServiceError');
    const ip = localStorage.getItem('mockIp');
    return lsError ? throwError('ip-error') : of(ip || this.ipSample);
  }
}

export class MockOwmFallbackDataService {
  getData() {
    return of(getNewDataObject('owm'));
  }
}

export class MockErrorsService {
  messages: AppErrorModel[] = [];
  errorLog = {
    '1-1-1-1': {
      '1610000000011': 'err message11',
      '1610000000012': 'err message12',
    },
    '2-2-2-2': {
      '1610000000021': 'err message21',
      '1610000000022': 'err message22',
    },
  };
  constructor() {
    this.messages = [];
  }
  getData() {
    return of(this.errorLog);
  }

  setDataToFB(newData: AppErrorModel) {
    return newData ? Promise.resolve() : Promise.reject();
  }
  add(message: AppErrorModel) {
    this.messages.push(message);
  }
}

export class MockHttpBackend {
  errorConnectionMessage: string;
  errorHttpMessage: string;
  responseMessage: string;

  setMessages(errorConnectionMessage, errorHttpMessage, responseMessage) {
    this.errorConnectionMessage = errorConnectionMessage;
    this.errorHttpMessage = errorHttpMessage;
    this.responseMessage = responseMessage;
  }

  handle(request): Observable<any> {
    if (request.url === 'error') {
      return throwError(new Error(this.errorConnectionMessage));
    } else if (request.url === 'http-error') {
      return throwError(new HttpErrorResponse({ error: new Error(this.errorHttpMessage) }));
    } else {
      return of(new HttpResponse({ status: 200, body: { message: this.responseMessage } }));
    }
  }
}

export class MockHistoryService {
  messages: AppHistoryPayloadModel[] = [];
  constructor() {
    this.messages = [];
  }
  setDataToFB(newData: AppHistoryPayloadModel) {
    return newData ? Promise.resolve() : Promise.reject();
  }
  add(message: AppHistoryPayloadModel) {
    this.messages.push(message);
  }
}

export class MockAngularFireService {
  fbdata: any;
  refkey: any = '';
  error: any = false;
  ref = {
    valueChanges: this.valueChanges.bind(this),
    set: this.setData.bind(this),
    update: this.update.bind(this),
  };

  constructor() { }

  object(refkey: string) {
    this.refkey = refkey;
    return this.ref;
  }

  setData(fbdata: any) {
    this.fbdata = fbdata;
    return fbdata ? Promise.resolve('Resolved') : Promise.reject('Rejected');
  }

  update(fbdata: any) {
    this.fbdata = { ...this.fbdata, ...fbdata };
    return fbdata ? Promise.resolve('Resolved') : Promise.reject('Rejected');
  }

  valueChanges() {
    return (
      (this.fbdata && (this.error ? throwError('MockAngularFireService Error: ' + this.error) : of(this.fbdata))) ||
      of(null)
    );
  }
}

export class MockSnackbarService {
  data: IPopupModel[] = [];

  show(newData: IPopupModel) {
    this.data.push(newData);
  }
}

export class MockPresenceService {
  connected = new BehaviorSubject(false);
  connectedUpdate(newValue) {
    this.connected.next(newValue);
  }
  connectedComplete() {
    this.connected.complete();
  }
  updateOnConnected() {
    return this.connected;
  }

  updateOnAway(fn) {
    fn();
  }
}

export class MockSwUpdate {
  eventUpdate = {
    type: 'UPDATE_AVAILABLE',
    current: {
      hash: 'string',
      appData: {
        buildInfo: {
          hash: '123456',
          timeStamp: 1234567890123,
          version: '0.12.1',
        },
      },
    },
    available: {
      hash: 'string',
      appData: {
        buildInfo: {
          hash: '234567',
          timeStamp: 1234567890987,
          version: '0.13.2',
        },
      },
    },
  };

  available = new Subject();

  availableUpdate(event) {
    this.available.next(event);
  }

  availableComplete() {
    this.available.complete();
  }
}

export class MockDocument {
  visibilityState = 'hidden';
  documentElement = {
    style: {
      setProperty: (property: string, value: any) => { },
    },
  };
}

export const historyLogMockData: IHistoryLog = {
  'dashed-ip01': {
    123456789011: 'cityId011',
    123456789014: 'cityId014',
    123456789015: 'cityId015',
    123456789013: 'cityId013',
    123456789012: 'cityId012',
  },
  'dashed-ip02': { 12345678902: 'cityId02' },
  'dashed-ip03': { 12345678903: 'cityId03' },
  'dashed-ip07': { 12345678907: 'cityId07' },
  'dashed-ip08': { 12345678908: 'cityId08' },
  'dashed-ip09': { 12345678909: 'cityId09' },
  'dashed-ip04': { 12345678904: 'cityId04' },
  'dashed-ip05': { 12345678905: 'cityId05' },
  'dashed-ip06': { 12345678906: 'cityId06' },
};

export const historyLogMockModelData: HistoryLogModel = {
  cityId: 'cityId',
  time: 1234567890123,
};


export const routerEventSubject = new ReplaySubject<RouterEvent>(1);

export const routerMock = {
  navigate: jasmine.createSpy('navigate'),
  events: routerEventSubject.asObservable(),
  url: 'test/url'
};

export const activatedRouteParamsSubject = new Subject<Params>();

export const activatedRouteMock = {
  params: activatedRouteParamsSubject.asObservable(),
  url: '',
};


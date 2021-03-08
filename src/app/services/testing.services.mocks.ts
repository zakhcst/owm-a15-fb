import { of, throwError } from 'rxjs';

import { IOwmDataModel } from '../models/owm-data.model';
import { ICities } from '../models/cities.model';
import { AppErrorPayloadModel, AppHistoryPayloadModel } from '../states/app.models';

import dataJSON from '../../assets/owm-fallback-data.json';
import citiesJSON from '../../../misc/cities-obj.json';
import { ISnackbarData } from '../models/snackbar.model';

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

  getOwmDataDebounced$({ showLoading }) {
    this.dbData = getNewDataObject();
    // if (showLoading) {
    //   this._store.dispatch(new SetStatusShowLoading(true));
    // }
    // return this.owmData$.pipe(
    //   tap(() => {
    //     if (showLoading) {
    //       this._store.dispatch(new SetStatusShowLoading(true));
    //     }
    //   }),
    //   filter((data) => !!data),
    //   debounce((data: IOwmDataModel) => (data.updated ? of(null) : timer(1000))),
    //   tap(() => {
    //     if (showLoading) {
    //       this._store.dispatch(new SetStatusShowLoading(false));
    //     }
    //   })
    //   );
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
  messages: AppErrorPayloadModel[] = [];
  constructor() {
    this.messages = [];
  }
  setDataToFB(newData: AppErrorPayloadModel) {
    return newData ? Promise.resolve() : Promise.reject();
  }
  add(message: AppErrorPayloadModel) {
    this.messages.push(message);
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
  error = false;
  ref = {
    valueChanges: this.valueChanges.bind(this),
    set: this.setData.bind(this),
    update: this.update.bind(this),
  };

  constructor() {}

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
    return this.fbdata && !this.error ? of(this.fbdata) : throwError('No data');
  }
}
export class MockSnackbarService {
  data: ISnackbarData[] = [];

  show(newData: ISnackbarData) {
    this.data.push(newData);
  }
}

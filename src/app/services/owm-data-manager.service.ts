import { Injectable } from '@angular/core';
import { of, Observable, timer, merge, throwError } from 'rxjs';
import { switchMap, catchError, tap, take, filter, debounce, mapTo, distinctUntilChanged, throttle } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DbOwmService } from './db-owm.service';
import { ErrorsService } from './errors.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Store, Select } from '@ngxs/store';
import { SetOwmDataCacheState, SetStatusShowLoading } from '../states/app.actions';
import { SnackbarService } from './snackbar.service';
import { ISnackbarData } from '../models/snackbar.model';
import { AppStatusState, AppOwmDataCacheState } from '../states/app.state';
import { StatsUpdateService } from './stats-update-dbrequests.service';
import { ConstantsService } from './constants.service';

@Injectable({
  providedIn: 'root',
})
export class OwmDataManagerService {
  snackbarOptions: ISnackbarData = {
    message: '',
    class: 'snackbar__warn',
    delay: 1000,
  };
  
  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  @Select(AppStatusState.away) away$: Observable<boolean>;
  @Select(AppOwmDataCacheState.selectOwmDataCacheSelectedCity) selectedCityOwmDataCache$: Observable<IOwmDataModel>;

  constructor(
    private _owm: OwmService,
    private _dbOwmData: DbOwmService,
    private _statsUpdate: StatsUpdateService,
    private _errors: ErrorsService,
    private _store: Store,
    private _snackbar: SnackbarService,
  ) {
    this.setSubscriptions();
  }

  setSubscriptions() {
    this.subscribeOnStatusChange();
  }

  subscribeOnStatusChange() {
    const that = this;
    merge(this.selectedCityId$, this.connected$, this.away$.pipe(switchMap(status => of(!status))))
      .pipe(
        filter(status => !!status),
        tap(_ => this._store.dispatch(new SetStatusShowLoading(true))),
        throttle((status: string | boolean) => {
          return timer(ConstantsService.loadingDataDebounceTime_ms*2).pipe(
            tap(() => {
              this._store.dispatch(new SetStatusShowLoading(false));
            }),
          );
        }, {leading: true, trailing: false}),
        switchMap(this.getDataMemory.bind(that)),
        tap(() => {
          this._store.dispatch(new SetStatusShowLoading(false));
        }),
      )
      .subscribe((data) => {
        this._store.dispatch(new SetOwmDataCacheState(data));
      });
  }

  getDataMemory(status: string | boolean): Observable<IOwmDataModel | null> {
    const lastOwmData = this._store.selectSnapshot(AppOwmDataCacheState.selectOwmDataCacheSelectedCity);
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory' });
    if (lastOwmData && this.isNotExpired(lastOwmData)) {
      return of(null);
    }
    return this.getDataDB(status || null);
  }

  getDataDB(cityId: string | boolean): Observable<IOwmDataModel | null> {
    const connected = this._store.selectSnapshot(AppStatusState.connected);
    const liveDataUpdate = this._store.selectSnapshot(AppStatusState.liveDataUpdate);
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);
    
    if (!connected) {
      return of(null);
    }
    if (liveDataUpdate && cityId === null) { 
      return this.getDataOWM(selectedCityId); 
    }

    this._snackbar.show({ ...this.snackbarOptions, message: 'Query DB' });

    return this.getDataServiceOrTimeout(this._dbOwmData.getData(selectedCityId)).pipe(
      tap(() => this.updateStatsDBRequests(selectedCityId)),
      switchMap((fbdata: IOwmDataModel) => {
        if (fbdata !== null && this.isNotExpired(fbdata)) {
          return of(fbdata);
        } else {
          return this.getDataOWM(selectedCityId);
        }
      }),
      catchError((err) => {
        this.addError(err);
        return of(null);
      })
    );
    
  }

  getDataOWM(cityId: string): Observable<IOwmDataModel | null> {
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query OWM' });
    return this.getDataServiceOrTimeout(this._owm.getData(cityId)).pipe(
      switchMap((newOwmData: IOwmDataModel) => of(this.setListByDate(newOwmData))),
      tap((newOwmData: IOwmDataModel) => this._dbOwmData.setData(cityId, newOwmData)),
      catchError((err) => {
        this.addError(err);
        return of(null);
      })
    );
  }

  getDataServiceOrTimeout(service: Observable<IOwmDataModel>) {
    const timeout = timer(ConstantsService.dataResponseTimeout_ms * 2).pipe(mapTo('timedout'));
    return merge(service, timeout).pipe(
      take(1),
      switchMap((data) => (data  === 'timedout') ? throwError('Service Timeout Error') : of(data))
    );
  }

  updateStatsDBRequests(cityId: string) {
    this._statsUpdate.updateStatsDBRequests(cityId);
  }

  setListByDate(data: IOwmDataModel): IOwmDataModel {
    data.listByDate = data.list.reduce((accumulator: any, item: any) => {
      const dateObj = new Date(item.dt * 1000);
      const hour = dateObj.getUTCHours();
      const date = dateObj.setHours(0);

      if (accumulator[date]) {
        accumulator[date][hour] = item;
      } else {
        accumulator[date] = {};
        accumulator[date][hour] = item;
      }
      return accumulator;
    }, {});
    data.updated = new Date().valueOf();
    return data;
  }

  // Caching the data for 3h
  // in order to prevent exceeding OWM requests dev quota.

  isNotExpired(data: IOwmDataModel): boolean {
    // expired data is when either [0] || .updated is older than 3 hours
    const now = new Date().valueOf();
    const firstDateTime = data.list && data.list.length > 0 && data.list[0].dt ? data.list[0].dt * 1000 : 0;
    const diff = now - (data.updated || firstDateTime || 0);
    return diff < 3 * 3600 * 1000; // < 3 hours
  }

  getOwmDataDebounced$({ showLoading }) {
    if (showLoading) {
      this._store.dispatch(new SetStatusShowLoading(true));
    }
    
    return this.selectedCityOwmDataCache$.pipe(
      tap(() => {
        if (showLoading) {
          this._store.dispatch(new SetStatusShowLoading(true));
        }
      }),
      filter((data) => !!data),
      distinctUntilChanged((prev, curr) => prev.updated === curr.updated),
      debounce((data: IOwmDataModel) => (data.updated && this.isNotExpired(data) ? of(null) : timer(ConstantsService.loadingDataDebounceTime_ms))),
      tap(() => {
        if (showLoading) {
          this._store.dispatch(new SetStatusShowLoading(false));
        }
      })
    );
  }

  addError(message) {
    this._errors.add({
      userMessage: 'Connection or service problem',
      logMessage: 'DbOwmService: getDataOWM: ' + message,
    });    
  }


}

import { Injectable } from '@angular/core';
import { of, Observable, timer, merge, throwError } from 'rxjs';
import { switchMap, catchError, tap, take, filter, debounce, mapTo } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DataService } from './data.service';
import { ErrorsService } from './errors.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Store, Select } from '@ngxs/store';
import { SetOwmDataCacheState, SetStatusShowLoading } from '../states/app.actions';
import { SnackbarService } from './snackbar.service';
import { ISnackbarData } from '../models/snackbar.model';
import { AppStatusState, AppOwmDataCacheState, AppFallbackDataState } from '../states/app.state';
import { StatsService } from './stats.service';
import { ConstantsService } from './constants.service';

@Injectable({
  providedIn: 'root',
})
export class OwmDataManagerService {
  snackbarOptions: ISnackbarData = {
    message: '',
    class: 'snackbar__warn',
    delay: 500,
  };
  getDataOnCityChangeInProgress = false;
  getDataOnConnectedInProgress = false;
  getDataOnBackFromAwayInProgress = false;
  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  @Select(AppStatusState.away) away$: Observable<boolean>;
  @Select(AppOwmDataCacheState.selectOwmDataCacheSelectedCity) selectedCityOwmDataCache$: Observable<IOwmDataModel>;

  constructor(
    private _owm: OwmService,
    private _fb: DataService,
    private _stats: StatsService,
    private _errors: ErrorsService,
    private _store: Store,
    private _snackbar: SnackbarService
  ) {
    this.setSubscriptions();
  }

  setSubscriptions() {
    this.subscribeAway();
    this.subscribeConnected();
    this.subscribeSelectedCityChange();
  }

  subscribeSelectedCityChange() {
    const that = this;
    this.selectedCityId$
      .pipe(
        tap(() => {
          this._store.dispatch(new SetStatusShowLoading(true));
          this.getDataOnCityChangeInProgress = true;
        }),
        switchMap((selectedCityId) => this.getDataMemoryOnCityChange(selectedCityId)),
        tap(() => {
          this._store.dispatch(new SetStatusShowLoading(false));
          this.getDataOnCityChangeInProgress = false;
        }),
        filter((data) => (this.getDataOnCityChangeInProgress = !!data))
      )
      .subscribe((data) => {
        this._store.dispatch(new SetOwmDataCacheState(data));
      });
  }

  subscribeConnected() {
    const that = this;
    this.connected$
      .pipe(
        filter(
          (connected) =>
          (this.getDataOnConnectedInProgress =
            connected && !this.getDataOnCityChangeInProgress && !this.getDataOnBackFromAwayInProgress)
        ),
        switchMap(that.getDataMemoryOnConnected.bind(that)),
        filter((data) => (this.getDataOnConnectedInProgress = !!data))
      )
      .subscribe((data) => {
        this._store.dispatch(new SetOwmDataCacheState(data));
        this.getDataOnConnectedInProgress = false;
      });
  }

  subscribeAway() {
    const that = this;
    this.away$
      .pipe(
        filter((away) => away !== undefined),
        filter(
          (away) =>
          (this.getDataOnBackFromAwayInProgress =
            !away && !this.getDataOnCityChangeInProgress && !this.getDataOnConnectedInProgress)
        ),
        switchMap(that.getDataMemoryOnAway.bind(that)),
        filter((data) => (this.getDataOnBackFromAwayInProgress = !!data))
      )
      .subscribe((data) => {
        this._store.dispatch(new SetOwmDataCacheState(data));
        this.getDataOnBackFromAwayInProgress = false;
      });
  }

  getDataMemoryOnAway(): Observable<IOwmDataModel | null> {
    const owmData = this._store.selectSnapshot(AppOwmDataCacheState.selectOwmDataCacheSelectedCity);
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory on back from away' });
    if (owmData && this.isNotExpired(owmData)) {
      return of(null);
    }
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);
    return this.getDataDB(selectedCityId);
  }

  getDataMemoryOnConnected(): Observable<IOwmDataModel> {
    const owmData = this._store.selectSnapshot(AppOwmDataCacheState.selectOwmDataCacheSelectedCity);
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory on connected' });
    if (owmData && this.isNotExpired(owmData)) {
      return of(null);
    }
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);
    return this.getDataDB(selectedCityId);
  }

  getDataMemoryOnCityChange(cityId: string): Observable<IOwmDataModel> {
    const lastOwmData = this._store.selectSnapshot(AppOwmDataCacheState.selectOwmDataCacheSelectedCity);
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory' });
    if (lastOwmData && this.isNotExpired(lastOwmData)) {
      return of(null);
    }
    return this.getDataDB(cityId);
  }

  getDataDB(cityId: string): Observable<IOwmDataModel> {
    const connected = this._store.selectSnapshot(AppStatusState.connected);
    if (connected) {
      this._snackbar.show({ ...this.snackbarOptions, message: 'Query DB' });
      return this.getDataServiceTimeout(this._fb.getData(cityId)).pipe(
        take(1),
        tap(() => this.updateStatsDBRequests(cityId)),
        switchMap((fbdata: IOwmDataModel) => {
          if (fbdata !== null && this.isNotExpired(fbdata)) {
            return of(fbdata);
          } else {
            return this.getDataOWM(cityId);
          }
        }),
        catchError((err) => {
          this._errors.add({
            userMessage: 'Connection or service problem',
            logMessage: 'DBDataService: getData: ' + err,
          });
          return of(null);
        })
      );
    } else {
      return of(null);
    }
  }

  getDataOWM(cityId: string): Observable<IOwmDataModel | null> {
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query OWM' });
    return this.getDataServiceTimeout(this._owm.getData(cityId)).pipe(
      switchMap((newOwmData: IOwmDataModel) => of(this.setListByDate(newOwmData))),
      catchError((err) => {
        this._errors.add({
          userMessage: 'Connection or service problem',
          logMessage: 'OwmDataService: getData: ' + err,
        });
        return of(null);
      })
    );
  }

  getDataServiceTimeout(service: Observable<IOwmDataModel>) {
    const timeout = timer(ConstantsService.dataResponseTimeout_ms * 3).pipe(mapTo(null));
    return merge(service, timeout).pipe(
      take(1),
      switchMap((data) => (data ? of(data) : throwError('Service Timeout Error')))
    );
  }

  updateStatsDBRequests(cityId: string) {
    this._stats.updateStatsDBRequests(cityId);
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
      debounce((data: IOwmDataModel) => (data.updated ? of(null) : timer(ConstantsService.loadingDataDebounceTime_ms))),
      tap(() => {
        if (showLoading) {
          this._store.dispatch(new SetStatusShowLoading(false));
        }
      })
    );
  }
}

/*
@Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$
@Select(AppStatusState.connected) connected$
@Select(AppStatusState.away) away$

constructor
                                                                          <-----\
selectedCityId$            connected$                 away$                     |
|                          |                          |                         |
getDataMemoryOnCityChange  getDataMemoryOnConnected   getDataMemoryOnAway       |
|                       \     /                   \    /                \       |
|------------------------\-------------------------\---                  \      |
|                         \                         \                     \     |
|                          \----------------------------------------------------|
|                                                                               |
getDataDB ----------- (updateStatsDBRequests)                                   |
|  |    \                                                                       |
|  |     \----------------------------------------------------------------------|
|   \                                                                           |
|    getDataOWM ----------- setListByDate --------------------------------------|
|    |                                                                          |
getFallbackData ----------------------------------------------------------------/
*/

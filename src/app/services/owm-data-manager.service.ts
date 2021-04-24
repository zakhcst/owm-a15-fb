import { Injectable } from '@angular/core';
import { of, Observable, combineLatest } from 'rxjs';
import { switchMap, catchError, tap, filter, distinctUntilChanged } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DbOwmService } from './db-owm.service';
import { ErrorsService } from './errors.service';
import { OwmDataUtilsService } from './owm-data-utils.service';
import { Store, Select } from '@ngxs/store';
import { SetOwmDataCacheState, SetPopupMessage, SetStatusShowLoading } from '../states/app.actions';
import { IOwmDataModel } from '../models/owm-data.model';
import { IPopupModel } from '../models/snackbar.model';
import { AppStatusState, AppOwmDataCacheState } from '../states/app.state';
import { StatsUpdateService } from './stats-update-dbrequests.service';

export interface IStatusChanges {
  selectedCityId: string;
  previousSelectedCityId: string;
}
@Injectable({
  providedIn: 'root',
})
export class OwmDataManagerService {

  popupOptions: IPopupModel = {
    message: '',
    class: 'popup__warn',
    delay: 500,
  };

  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  @Select(AppStatusState.away) away$: Observable<boolean>;

  constructor(
    private _owm: OwmService,
    private _dbOwmData: DbOwmService,
    private _statsUpdate: StatsUpdateService,
    private _errors: ErrorsService,
    private _store: Store,
    private _utils: OwmDataUtilsService,

  ) {
    this.setSubscriptions();
  }

  setSubscriptions() {
    this.subscribeOnStatusChange();
  }

  subscribeOnStatusChange() {
    const that = this;
    let first = true;
    let prev: any;
    combineLatest([this.selectedCityId$, this.connected$, this.away$])
      .pipe(
        distinctUntilChanged((previous, current) => {
          prev = previous;
          const [prevCityId, prevConn, prevAway] = previous;
          const [currCityId, currConn, currAway] = current;
          if (
            (currAway === true)
            || (currConn === false)
            || (prevCityId === currCityId && prevConn === currConn && prevAway === currAway)
           ) {
            return true;
          }
        }),
        filter(() => first ? first = false : true),
        switchMap(status => of({ selectedCityId: status[0], previousSelectedCityId: prev[0] })),
        tap(() => this._store.dispatch(new SetStatusShowLoading(true))),
        switchMap(this.getDataMemory.bind(that)),
        tap(() => this._store.dispatch(new SetStatusShowLoading(false))),
        filter((data) => !!data)
      ).subscribe((data) => {
        this._store.dispatch(new SetOwmDataCacheState(data));
      });
  }

  getDataMemory(status: IStatusChanges): Observable<IOwmDataModel | null> {
    const lastOwmData = this._store.selectSnapshot(AppOwmDataCacheState.selectOwmDataCacheSelectedCity);
    this._store.dispatch(new SetPopupMessage({ ...this.popupOptions, message: 'Query memory cache' }));
    if (lastOwmData && this._utils.isNotExpired(lastOwmData)) {
      return of(null);
    }
    return this.getDataDB(status);
  }

  getDataDB({ selectedCityId, previousSelectedCityId }: IStatusChanges): Observable<IOwmDataModel | null> {
    const liveDataUpdate = this._store.selectSnapshot(AppStatusState.liveDataUpdate);
    
    if (liveDataUpdate && selectedCityId === previousSelectedCityId) {
      return this.getDataOWM(selectedCityId);
    }

    this._store.dispatch(new SetPopupMessage({ ...this.popupOptions, message: 'Query DB' }));

    return this._utils.getDataServiceOrTimeout(this._dbOwmData.getData(selectedCityId)).pipe(
      tap(() => this.updateStatsDBRequests(selectedCityId)),
      switchMap((fbdata: IOwmDataModel) => {
        if (fbdata !== null && this._utils.isNotExpired(fbdata)) {
          // concurent case with DbOwmService, on liveDataUpdate DbOwmService to handle data update
          if (liveDataUpdate) { 
            return of(null);
          }
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
    this._store.dispatch(new SetPopupMessage({ ...this.popupOptions, message: 'Query OWM' }));
    return this._utils.getDataServiceOrTimeout(this._owm.getData(cityId)).pipe(
      switchMap((newOwmData: IOwmDataModel) => of(this._utils.setListByDate(newOwmData))),
      tap((newOwmData: IOwmDataModel) => this._dbOwmData.setData(cityId, newOwmData)),
      catchError((err) => {
        this.addError(err);
        return of(null);
      })
    );
  }

  updateStatsDBRequests(cityId: string) {
    this._statsUpdate.updateStatsDBRequests(cityId);
  }

  addError(message) {
    this._errors.add({
      userMessage: 'Connection or service problem',
      logMessage: 'DbOwmService: getDataOWM: ' + message,
    });
  }

}

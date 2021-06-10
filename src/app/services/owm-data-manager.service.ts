import { Injectable } from '@angular/core';
import { of, Observable, combineLatest, Subscription } from 'rxjs';
import { switchMap, catchError, tap, filter } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DbOwmService } from './db-owm.service';
import { ErrorsService } from './errors.service';
import { OwmDataUtilsService } from './owm-data-utils.service';
import { Store, Select } from '@ngxs/store';
import { SetPopupMessage, SetStatusShowLoading } from '../states/app.actions';
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

  combineLatestStatusSubscription: Subscription;
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

  combineLatestStatus() {
    let previous: any[] = [null, true, false];
    return combineLatest([this.selectedCityId$, this.connected$, this.away$])
      .pipe(
        filter((status) => {
          const passCondition =
            status[1] === true &&
            status[2] === false &&
            (status[0] !== previous[0] || status[1] !== previous[1] || status[2] !== previous[2]);
          if (!passCondition) {
            previous = status;
          }
          return passCondition;
        }
        ),
        tap(() => this._store.dispatch(new SetStatusShowLoading(true))),
        switchMap(status => {
          const previousCurrentCityIds = { selectedCityId: status[0], previousSelectedCityId: (previous[0] || status[0]) };
          previous = status;
          return this.getDataMemory(previousCurrentCityIds);
        }),
        tap(() => this._store.dispatch(new SetStatusShowLoading(false))),
        filter((data) => !!data),
        switchMap(data => this._utils.setOwmDataCache(data, false))
      );
  }

  subscribeOnStatusChange() {
    this.combineLatestStatusSubscription = this.combineLatestStatus().subscribe();
  }

  getDataMemory(status: IStatusChanges): Observable<IOwmDataModel | null> {
    const lastOwmData = this._store.selectSnapshot(AppOwmDataCacheState.selectOwmDataCachedOrDefaultSelectedCity);
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

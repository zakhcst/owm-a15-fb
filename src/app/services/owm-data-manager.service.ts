import { Injectable } from '@angular/core';
import { of, Observable, pipe } from 'rxjs';
import { switchMap, catchError, map, tap, take, filter } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DataService } from './data.service';
import { CitiesService } from './cities.service';
import { OwmFallbackDataService } from './owm-fallback-data.service';
import { ErrorsService } from './errors.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Store, Select } from '@ngxs/store';
import { SetDataState } from '../states/app.actions';
import { SnackbarService } from './snackbar.service';
import { ISnackbarData } from '../models/snackbar.model';
import { AppStatusState, AppHistoryState, AppOwmDataState, AppFallbackDataState } from '../states/app.state';

@Injectable({
  providedIn: 'root',
})
export class OwmDataManagerService {
  snackbarOptions: ISnackbarData = {
    message: '',
    class: 'snackbar__warn',
    delay: 100,
  };
  getDataOnCityChangeInProgress = false;
  getDataOnConnectedInProgress = false;
  getDataOnBackFromAwayInProgress = false;
  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  @Select(AppStatusState.away) away$: Observable<boolean>;

  constructor(
    private _owm: OwmService,
    private _fb: DataService,
    private _cities: CitiesService,
    private _owmFallback: OwmFallbackDataService,
    private _errors: ErrorsService,
    private _store: Store,
    private _snackbar: SnackbarService
  ) {
    this.selectedCityId$
      .pipe(
        tap(() => {
          this.getDataOnCityChangeInProgress = true;
        }),
        switchMap((selectedCityId) => this.getDataMemoryOnCityChange(selectedCityId))
      )
      .subscribe((data) => {
        this.getDataOnCityChangeInProgress = false;
        if (data) {
          this._store.dispatch(new SetDataState(data));
        }
      });

    this.connected$
      .pipe(
        filter(
          (connected) =>
            (this.getDataOnConnectedInProgress =
              connected && !this.getDataOnCityChangeInProgress && !this.getDataOnBackFromAwayInProgress)
        ),
        switchMap(() => this.getDataMemoryOnConnected()),
        filter((data) => !!data)
      )
      .subscribe((data) => {
        this._store.dispatch(new SetDataState(data));
        this.getDataOnConnectedInProgress = false;
      });

    this.away$
      .pipe(
        filter(
          (away) =>
            (this.getDataOnBackFromAwayInProgress =
              !away && !this.getDataOnCityChangeInProgress && !this.getDataOnConnectedInProgress)
        ),
        switchMap(() => this.getDataMemoryOnAway()),
        filter((data) => !!data)
      )
      .subscribe((data) => {
        this._store.dispatch(new SetDataState(data));
        this.getDataOnBackFromAwayInProgress = false;
      });
  }

  getDataMemoryOnAway(): Observable<IOwmDataModel> {
    const owmData = this._store.selectSnapshot(AppOwmDataState.selectOwmData);
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory on back from away' });
    if (owmData && this.isNotExpired(owmData)) {
      return of(null);
    }
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);
    return this.getDataDB(selectedCityId);
  }

  getDataMemoryOnConnected(): Observable<IOwmDataModel> {
    const owmData = this._store.selectSnapshot(AppOwmDataState.selectOwmData);
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory on connected' });
    if (owmData && this.isNotExpired(owmData)) {
      return of(null);
    }
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);
    return this.getDataDB(selectedCityId);
  }

  getDataMemoryOnCityChange(cityId: string): Observable<IOwmDataModel> {
    const lastOwmData = this._store.selectSnapshot(AppHistoryState.selectSelectedCityHistoryLast);

    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory' });
    if (lastOwmData && this.isNotExpired(lastOwmData)) {
      return of(lastOwmData);
    }
    return this.getDataDB(cityId);
  }

  getDataDB(cityId: string): Observable<IOwmDataModel> {
    const connected = this._store.selectSnapshot(AppStatusState.connected);
    if (connected) {
      this._snackbar.show({ ...this.snackbarOptions, message: 'Query DB' });
      return this._fb.getData(cityId).pipe(
        take(1),
        tap(() => this.updateDBReads(cityId)),
        switchMap((fbdata: IOwmDataModel) => {
          if (fbdata !== null && this.isNotExpired(fbdata)) {
            return of(fbdata);
          } else {
            return this.getDataOWM(cityId);
          }
        })
      );
    } else {
      return this.getFallbackData();
    }
  }

  updateDBReads(cityId: string) {
    this._cities.updateReads(cityId);
  }

  getDataOWM(cityId: string): Observable<IOwmDataModel> {
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query OWM' });
    return this._owm.getData(cityId).pipe(
      switchMap((newOwmData: IOwmDataModel) => of(this.setListByDate(newOwmData))),
      catchError((err) => {
        this._errors.add({
          userMessage: 'Connection or service problem',
          logMessage: 'OwmDataService: getData: ' + err,
        });
        return this.getFallbackData();
      })
    );
  }

  getFallbackData(): Observable<IOwmDataModel> {
    let lastOwmData = this._store.selectSnapshot(AppHistoryState.selectSelectedCityHistoryLast);
    if (lastOwmData) {
      return of(lastOwmData);
    }
    lastOwmData = this._store.selectSnapshot(AppFallbackDataState.selectFallbackData);
    if (lastOwmData) {
      return of(lastOwmData);
    }
    return of(null);
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
getDataDB ----------- (updateDBReads)                                           |
|  |    \                                                                       |
|  |     \----------------------------------------------------------------------|
|   \                                                                           |
|    getDataOWM ----------- setListByDate --------------------------------------|
|    |                                                                          |
getFallbackData ----------------------------------------------------------------/
*/










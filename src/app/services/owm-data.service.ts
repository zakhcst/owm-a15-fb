import { Injectable } from '@angular/core';
import { of, Observable, pipe } from 'rxjs';
import { switchMap, catchError, map, tap, take } from 'rxjs/operators';
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
import { AppStatusState, AppHistoryState } from '../states/app.state';

@Injectable({
  providedIn: 'root',
})
export class OwmDataService {
  snackbarOptions: ISnackbarData = {
    message: '',
    class: 'snackbar__warn',
    delay: 100,
  };

  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;

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
      .pipe(switchMap((selectedCityId) => this.getDataMemory(selectedCityId)))
      .subscribe(data => this._store.dispatch(new SetDataState(data)));
  }

  getDataMemory(cityId: string): Observable<IOwmDataModel> {
    const lastOwmData = this._store.selectSnapshot(AppHistoryState.selectSelectedCityHistoryLast);

    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory' });
    if (lastOwmData && this.isNotExpired(lastOwmData)) {
      return of(lastOwmData);
    }
    return this.getDataDB(cityId);
  }

  getDataDB(cityId: string): Observable<IOwmDataModel> {
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
  }

  updateDBReads(cityId: string) {
    this._cities.updateReads(cityId);
  }

  getDataOWM(cityId: string): Observable<IOwmDataModel> {
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query OWM' });
    return this._owm.getData(cityId).pipe(
      switchMap((newOwmData: IOwmDataModel) => of(this.setListByDate(newOwmData))),
      catchError(err => {
        this._errors.add({
          userMessage: 'Connection or service problem',
          logMessage: 'OwmDataService: getData: ' + err.message
        });
        return this.getFallbackData();
      })
    );
  }

  getFallbackData(): Observable<IOwmDataModel> {
    return this._owmFallback.getData();
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
  //  in order to prevent exceeding OWM requests dev quota.

  isNotExpired(data: IOwmDataModel): boolean {
    // expired data is when either [0] || .updated is older than 3 hours
    const now = new Date().valueOf();
    const firstDateTime = data.list && data.list.length > 0 && data.list[0].dt ? data.list[0].dt * 1000 : 0;
    const diff = now - (data.updated || firstDateTime || 0);
    return diff < 3 * 3600 * 1000; // < 3 hours
  }
}

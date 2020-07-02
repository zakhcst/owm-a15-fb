import { Injectable } from '@angular/core';
import { of, from, Observable, throwError, pipe } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DataService } from './data.service';
import { CitiesService } from './cities.service';
import { OwmFallbackDataService } from './owm-fallback-data.service';
import { ErrorsService } from './errors.service';
import { IOwmDataModel, IOwmDataModelObjectByCityId } from '../models/owm-data.model';
import { Store, Select } from '@ngxs/store';
import { SetDataState } from '../states/app.actions';
import { SnackbarService } from './snackbar.service';
import { ISnackbarData } from '../models/snackbar.model';
import { ConstantsService } from './constants.service';
import { AppStatusState, AppOwmDataState, AppHistoryState } from '../states/app.state';

@Injectable({
  providedIn: 'root',
})
export class OwmDataService {
  private cachedData: IOwmDataModelObjectByCityId = {};
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
    this.selectedCityId$.pipe(switchMap((selectedCityId) => this.dataRefreshTrigger(selectedCityId))).subscribe();
  }

  dataRefreshTrigger(cityId: string): Observable<IOwmDataModel> {
    return this.getDataQueryMemory(cityId);
  }

  getDataQueryMemory(cityId: string): Observable<IOwmDataModel> {
    const lastOwmData = this._store.selectSnapshot(AppHistoryState.selectSelectedCityHistoryLast);

    this._snackbar.show({ ...this.snackbarOptions, message: 'Query memory' });
    if (lastOwmData && this.isNotExpired(lastOwmData)) {
      this._store.dispatch(new SetDataState(lastOwmData));
      return of(lastOwmData);
    }
    return this.getDataQueryDB(cityId);
  }

  getDataQueryDB(cityId: string): Observable<IOwmDataModel> {
    console.log('getDataQueryDB');
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query DB' });
    return this._fb.getData(cityId).pipe(
      tap(() => this.updateDBReads(cityId)),
      switchMap((fbdata: IOwmDataModel) => {
        if (fbdata !== null && this.isNotExpired(fbdata)) {
          this._store.dispatch(new SetDataState(fbdata));
          return of(fbdata);
        } else {
          return this.getDataQueryOWM(cityId);
        }
      })
    );
  }

  updateDBReads(cityId: string) {
    this._cities.updateReads(cityId);
  }

  getDataQueryOWM(cityId: string): Observable<IOwmDataModel> {
    this._snackbar.show({ ...this.snackbarOptions, message: 'Query OWM' });
    return this.requestOwm(cityId).pipe(
      switchMap((data: IOwmDataModel) => {
        this._store.dispatch(new SetDataState(data));
        return of(data);
      })
    );
  }

  requestOwm(cityId: string): Observable<IOwmDataModel> {
    return this._owm.getData(cityId).pipe(
      map((newOwmData: IOwmDataModel) => this.setListByDate(newOwmData)),
      tap((newOwmDataIncludingListByDate: IOwmDataModel) => this._fb.setData(cityId, newOwmDataIncludingListByDate)),
      switchMap((newOwmDataIncludingListByDate) => of(newOwmDataIncludingListByDate)),
      catchError(err => this.getFallbackData())
    );
  }

  getFallbackData(): Observable<IOwmDataModel> {
    return this._owmFallback.getData().pipe(
      switchMap((sampleData: IOwmDataModel) => {
        this._store.dispatch(new SetDataState(sampleData));
        return of(sampleData);
      })
    );
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

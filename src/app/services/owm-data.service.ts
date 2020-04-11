import { Injectable } from '@angular/core';
import { of, from, Observable, throwError } from 'rxjs';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { OwmService } from './owm.service';
import { DataService } from './data.service';
import { CitiesService } from './cities.service';
import { OwmFallbackDataService } from './owm-fallback-data.service';
import { ErrorsService } from './errors.service';
import { IOwmData, IOwmDataObjectByCityId } from '../models/owm-data.model';
import { Store } from '@ngxs/store';
import { SetDataState } from '../states/app.actions';
import { SnackbarService } from './snackbar.service';
import { ISnackbarData } from '../models/snackbar.model';
import { ConstantsService } from './constants.service';

@Injectable({
  providedIn: 'root'
})
export class OwmDataService {
  private cachedData: IOwmDataObjectByCityId = {};
  snackbarOptions: ISnackbarData = {
    message: '',
    class: 'snackbar__warn',
    delay: 100
  };
  constructor(
    private _owm: OwmService,
    private _fb: DataService,
    private _cities: CitiesService,
    private _owmFallback: OwmFallbackDataService,
    private _errors: ErrorsService,
    private _store: Store,
    private _snackbar: SnackbarService
  ) {}

  dataRefreshTrigger(cityId?: string) {
    cityId = cityId || ConstantsService.defaultCityId;
    return this.getData(cityId);
  }

  // Caching the data for 3h
  // in order to prevent exceeding OWM requests dev quota.
  // The additional logic for processing/reformating the data
  // is required in the front end in order to avoid
  // Firebase Cloud Functions outbound http requests
  getData(cityId: string): Observable<IOwmData> {
    
    this._snackbar.show({...this.snackbarOptions, message: 'Query memory'});
    if (this.cachedData[cityId] && this.isNotExpired(this.cachedData[cityId])) {
      return of(this.cachedData[cityId])
      .pipe(
        tap((data: IOwmData) => {
          this._store.dispatch(new SetDataState(data));
        })
      );
    }

    this._snackbar.show({...this.snackbarOptions, message: 'Query DB'});
    return this._cities.updateReads(cityId).pipe(
      switchMap(() => from(this._fb.getData(cityId))),
      switchMap((fbdata: IOwmData) => {
        if (fbdata !== null && this.isNotExpired(fbdata)) {
          this.cachedData[cityId] = fbdata;
          return of(fbdata).pipe(
            tap(() => {
              this._store.dispatch(new SetDataState(fbdata));
            })
          );
        }

        this._snackbar.show({...this.snackbarOptions, message: 'Query OWM'});
        return this.requestNewOwmData(cityId).pipe(
          switchMap(() => {
            return of(fbdata);
          })
          , tap((data: IOwmData) => {
            this._store.dispatch(new SetDataState(data));
          })
        );
      }),
      catchError(err => {
        this._errors.add({
          userMessage: 'Connection or service problem',
          logMessage:
            'OwmDataService:getData:_fb.getData: ' + (err.message || err)
        });
        return (this.cachedData[cityId] ? of(this.cachedData[cityId]) : this._owmFallback.getData()).pipe(
          tap((data: IOwmData) => {
            this._store.dispatch(new SetDataState(data));
          })
        );
      })
    );
  }

  requestNewOwmData(cityId: string) {
    return this._owm.getData(cityId).pipe(
      map((res: IOwmData) => this.setListByDate(res)),
      tap(listByDate => {
        this.cachedData[cityId] = listByDate;
      }),
      switchMap(res => from(this._fb.setData(cityId, res))),
      catchError(err => {
        this._errors.add({
          userMessage: 'Connection or service problem',
          logMessage:
            'OwmDataService:getData:_fb.getData: requestNewOwmData: ' +
            (err.message || err)
        });
        return throwError('CitiesService: updateReads: ' + err);
      })
    );
  }

  setListByDate(data: IOwmData): IOwmData {
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

  isNotExpired(data: IOwmData): boolean {
    // expired data is when either [0] || .updated is older than 3 hours
    const now = new Date().valueOf();
    const firstDateTime =
      data.list && data.list.length > 0 && data.list[0].dt
        ? data.list[0].dt * 1000
        : 0;
    const diff = now - (data.updated || firstDateTime || 0);
    return diff < 3 * 3600 * 1000; // < 3 hours
  }
}

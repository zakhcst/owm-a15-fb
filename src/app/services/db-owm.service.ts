import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Observable, of, Subscription } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { AppStatusState } from '../states/app.state';
import { delay, filter, switchMap, take, tap } from 'rxjs/operators';
import { SetOwmDataCacheState } from '../states/app.actions';
import { OwmDataUtilsService } from './owm-data-utils.service';

@Injectable({
  providedIn: 'root',
})
export class DbOwmService {
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;
  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  liveDataUpdateSubscription: Subscription;
  getDataSubscription: Subscription;

  constructor(private _db: AngularFireDatabase, private _store: Store, private _utils: OwmDataUtilsService) {
    this.activateLiveDataUpdateDB();
  }

  getData(cityId: string): Observable<IOwmDataModel> {
    return this._db.object<IOwmDataModel>(ConstantsService.owmData + '/' + cityId).valueChanges();
  }

  setData(cityId: string, data: IOwmDataModel) {
    const ref = this._db.object(ConstantsService.owmData + '/' + cityId);
    return ref.set(data);
  }

  subscribeToGetData() {
    this.getDataSubscription = this.selectedCityId$
      .pipe(
        switchMap((cityId) => this.getData(cityId)),
        filter((data) => !!data),
        delay(ConstantsService.loadingDataDebounceTime_ms)
      )
      .subscribe((owmData) => {
        this.dispatch(owmData);
      });
  }

  activateLiveDataUpdateDB() {
    this.liveDataUpdateSubscription = this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.getDataSubscription) {
        this.getDataSubscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscribeToGetData();
      }
    });
  }

  dispatch(owmData) {
    this._store.dispatch(new SetOwmDataCacheState(owmData));
  }
}

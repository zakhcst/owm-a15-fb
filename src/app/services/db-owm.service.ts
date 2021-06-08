import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Observable, Subscription } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppStatusState } from '../states/app.state';
import { delay, filter, switchMap } from 'rxjs/operators';
import { OwmDataUtilsService } from './owm-data-utils.service';

@Injectable({
  providedIn: 'root',
})
export class DbOwmService {
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;
  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  liveDataUpdateSubscription: Subscription;
  getDataSubscription: Subscription;

  constructor(private _db: AngularFireDatabase, private _utils: OwmDataUtilsService) {
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
        delay(ConstantsService.loadingDataDebounceTime_ms),
        switchMap((cityId) => this.getData(cityId)),
        filter((data) => !!data),
      )
      .subscribe((owmData) => {
        this.updateCache(owmData);
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

  updateCache(owmData) {
    this._utils.setOwmDataCache(owmData);
  }
}

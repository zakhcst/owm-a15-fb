import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { Observable, Subscription } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { AppStatusState } from '../states/app.state';
import { switchMap } from 'rxjs/operators';
import { SetOwmDataCacheState } from '../states/app.actions';

@Injectable({
  providedIn: 'root'
})
export class DbOwmService {
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;
  @Select(AppStatusState.selectStatusSelectedCityId) selectedCityId$: Observable<string>;
  subscription: Subscription;
  
  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdateDB();
  }


  getData(cityId: string): Observable<IOwmDataModel> {
    return this._db.object<IOwmDataModel>(ConstantsService.owmData + '/' + cityId).valueChanges();
  }

  setData(cityId: string, data: IOwmDataModel) {
    const ref = this._db.object(ConstantsService.owmData + '/' + cityId);
    return ref.set(data);
  }

  activateLiveDataUpdateDB() {
    this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscription = this.selectedCityId$.pipe(
          switchMap(cityId => this.getData(cityId))

        ).subscribe((owmData) => {
          this.dispatch(owmData);
        });
      } 
    });
  }

  dispatch(owmData) {
    this._store.dispatch(new SetOwmDataCacheState(owmData));
  }

}

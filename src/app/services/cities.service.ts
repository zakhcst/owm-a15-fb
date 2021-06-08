import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ICities } from '../models/cities.model';
import { SetCitiesState, SetPopupMessage, SetStatusSelectedCityId } from '../states/app.actions';
import { AppCitiesState, AppStatusState } from '../states/app.state';
@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  liveDataUpdateSubscription: Subscription;
  getDataSubscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesCities();
  }

  getData(): Observable<ICities> {
    return this._db.object<ICities>('cities').valueChanges();
  }

  subscribeToGetData() {
    this.getDataSubscription = this.getData().subscribe((cities) => {
      this.dispatch(cities);
    });
  }

  getDataOnce() {
    const ipHistoryLog = this._store.selectSnapshot(AppCitiesState.selectCities);
    if (!ipHistoryLog) {
      this.getData()
        .pipe(take(1))
        .subscribe((cities) => this.dispatch(cities));
    }
  }

  activateLiveDataUpdatesCities() {
    this.liveDataUpdateSubscription = this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.getDataSubscription && !this.getDataSubscription.closed) {
        this.getDataSubscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscribeToGetData();
      } else {
        this.getDataOnce();
      }
    });
  }

  setSelectedCityId(selectedCityId) {
    const cities = this._store.selectSnapshot(AppCitiesState.selectCities);
    const cityName = cities?.[selectedCityId]?.name;
    const countryISO2 = cities?.[selectedCityId]?.iso2;
    if (cities && cityName && countryISO2) {
      this._store.dispatch(new SetPopupMessage({
        message: `Selected: ${cityName}, ${countryISO2}`,
        class: 'popup__info',
        delay: 500
      }));
      this._store.dispatch(new SetStatusSelectedCityId(selectedCityId));
    }
  }

  dispatch(cities) {
    this._store.dispatch(new SetCitiesState(cities));
  }
}

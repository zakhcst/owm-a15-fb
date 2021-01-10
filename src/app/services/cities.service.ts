import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { take} from 'rxjs/operators';
import { ICities } from '../models/cities.model';
import { SetCitiesState } from '../states/app.actions';
import { AppCitiesState, AppStatusState } from '../states/app.state';
@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  subscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesCities();
  }

  getData(): Observable<ICities> {
    return this._db.object<ICities>('cities').valueChanges();
  }

  activateLiveDataUpdatesCities() {
    this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscription = this.getData().subscribe((cities) => {
          this.dispatch(cities);
        });
      } else {
        const cities = this._store.selectSnapshot(AppCitiesState.selectCities);
        if (!cities) {
          this.getData()
            .pipe(take(1))
            .subscribe((cities) => this.dispatch(cities));
        }
      }
    });
  }
  dispatch(cities) {
    this._store.dispatch(new SetCitiesState(cities));
  }
}

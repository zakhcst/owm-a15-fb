import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Select, Store } from '@ngxs/store';
import { from, Observable, Subscription, throwError } from 'rxjs';
import { switchMap, take, catchError } from 'rxjs/operators';
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

  updateReads(cityId: string) {
    if (!cityId) {
      return throwError('CitiesService: updateReads: CityId not provided');
    }
    const ref = this._db.object(`/stats/${cityId}`);
    return ref.valueChanges().pipe(
      take(1),
      switchMap((city: any) => {
        return from(ref.update({ reads: ((city && city.reads) || 0) + 1 }));
      }),
      catchError((err) => {
        console.log(err);
        return throwError('CitiesService: updateReads: ' + err);
      })
    );
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

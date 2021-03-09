import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from, Observable, Subscription, throwError } from 'rxjs';
import { IStats } from '../models/stats.model';
import { Select, Store } from '@ngxs/store';
import { SetStatsState } from '../states/app.actions';
import { AppStatsState, AppStatusState } from '../states/app.state';
import { catchError, switchMap, take } from 'rxjs/operators';
import { ConstantsService } from './constants.service';
@Injectable({
  providedIn: 'root',
})
export class StatsService {
  subscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesStats();
  }

  getData(): Observable<IStats> {
    return this._db.object(ConstantsService.stats).valueChanges();
  }

  activateLiveDataUpdatesStats() {
    this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscription = this.getData().subscribe((stats) => {
          this.dispatch(stats);
        });
      } else {
        const stats = this._store.selectSnapshot(AppStatsState.selectStats);
        if (!stats) {
          this.getData().pipe(take(1)).subscribe((stats) => this.dispatch(stats));
        }
      }
    });
  }

  dispatch(stats) {
    this._store.dispatch(new SetStatsState(stats));
  }

  updateStatsDBRequests(cityId: string) {
    if (!cityId) {
      return throwError('StatsService: updateReads: CityId not provided');
    }
    const path = ConstantsService.stats + '/' + cityId;
    const ref = this._db.object(path);
    return ref.valueChanges().pipe(
      take(1),
      switchMap((city: any) => {
        const newValue = ((city && city.r) || 0) + 1;
        console.log('StatsService:', path, city?.r, newValue);
        return from(ref.update({ r: newValue })).pipe(catchError((err) => {
          console.log('Error StatsService:', path, city?.r, newValue);
          return throwError(err);
        }));
      }),
      catchError((err) => {
        console.log(err);
        return throwError('StatsService: updateReads: ' + err);
      })
    ).subscribe();
  }

}

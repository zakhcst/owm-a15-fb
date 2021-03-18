import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from, Observable, Subscription, throwError } from 'rxjs';
import { IStats } from '../models/stats.model';
import { Select, Store } from '@ngxs/store';
import { SetStatsState } from '../states/app.actions';
import { AppStatsState, AppStatusState } from '../states/app.state';
import { take } from 'rxjs/operators';
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
        const statsStore = this._store.selectSnapshot(AppStatsState.selectStats);
        if (!statsStore) {
          this.getData().pipe(take(1)).subscribe((statsDB) => this.dispatch(statsDB));
        }
      }
    });
  }

  dispatch(stats) {
    this._store.dispatch(new SetStatsState(stats));
  }

}

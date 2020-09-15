import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, Subscription } from 'rxjs';
import { IOwmStats } from '../models/owm-stats.model';
import { Select, Store } from '@ngxs/store';
import { SetStatsState } from '../states/app.actions';
import { AppStatsState, AppStatusState } from '../states/app.state';
import { take } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class OwmStatsService {
  subscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesStats();
  }

  getData(): Observable<IOwmStats> {
    return this._db.object('/stats').valueChanges();
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
}

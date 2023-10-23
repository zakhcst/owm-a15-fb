import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, Subscription } from 'rxjs';
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
  liveDataUpdateSubscription: Subscription;
  getDataSubscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesStats();
  }

  getData(): Observable<IStats> {
    return <any>this._db.object(ConstantsService.stats).valueChanges();
  }

  subscribeToGetData() {
    this.getDataSubscription = this.getData().subscribe((stats: IStats) => {
      this.dispatch(stats);
    });
  }

  getDataOnce() {
    const statsStore = this._store.selectSnapshot(AppStatsState.selectStats);
    if (!statsStore) {
      this.getData().pipe(take(1)).subscribe((statsDB) => this.dispatch(statsDB));
    }
  }

  activateLiveDataUpdatesStats() {
    this.liveDataUpdateSubscription = this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.getDataSubscription) {
        this.getDataSubscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscribeToGetData();
      } else {
        this.getDataOnce();
      }
    });
  }

  dispatch(stats) {
    this._store.dispatch(new SetStatsState(stats));
  }

  shudown() {
    if (this.getDataSubscription.closed === false) {
      this.getDataSubscription.unsubscribe();
    }
    if (this.liveDataUpdateSubscription.closed === false) {
      this.liveDataUpdateSubscription.unsubscribe();
    }
  }

}

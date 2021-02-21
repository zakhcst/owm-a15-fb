import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { IHistoryLog } from '../models/history-log.model';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { AppHistoryLogState, AppStatusState } from '../states/app.state';
import { SetHistoryLogState } from '../states/app.actions';
@Injectable({
  providedIn: 'root',
})
export class HistoryLogService {
  subscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesHistoryLog();
  }

  getData(): Observable<IHistoryLog> {
    return this._db.object<IHistoryLog>(ConstantsService.historyLog).valueChanges();
  }

  activateLiveDataUpdatesHistoryLog() {
    this.liveDataUpdate$.subscribe((liveDataUpdate) => {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      if (liveDataUpdate) {
        this.subscription = this.getData().subscribe((logs) => {
          this.dispatch(logs);
        });
      } else {
        const ipHistoryLog = this._store.selectSnapshot(AppHistoryLogState.selectHistoryLog);
        if (!ipHistoryLog) {
          this.getData()
            .pipe(take(1))
            .subscribe((logs) => this.dispatch(logs));
        }
      }
    });
  }
  dispatch(logs) {
    this._store.dispatch(new SetHistoryLogState(logs));
  }
}

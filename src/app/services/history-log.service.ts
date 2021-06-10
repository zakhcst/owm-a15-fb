import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { IHistoryLog } from '../models/history-log.model';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { AppHistoryLogState, AppStatusState } from '../states/app.state';
import { SetHistoryLogState } from '../states/app.actions';
import { HistoryLogModel } from '../states/app.models';
@Injectable({
  providedIn: 'root',
})
export class HistoryLogService {
  liveDataUpdateSubscription: Subscription;
  getDataSubscription: Subscription;
  @Select(AppStatusState.liveDataUpdate) liveDataUpdate$: Observable<boolean>;

  constructor(private _db: AngularFireDatabase, private _store: Store) {
    this.activateLiveDataUpdatesHistoryLog();
  }

  getData(): Observable<IHistoryLog> {
    return this._db.object<IHistoryLog>(ConstantsService.historyLog).valueChanges();
  }

  setDataToFB(normIp: string, data: HistoryLogModel) {
    const refKey = ConstantsService.historyLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.cityId);
  }

  subscribeToGetData() {
    this.getDataSubscription = this.getData().subscribe((logs) => {
      this.dispatch(logs);
    });
  }

  getDataOnce() {
    const ipHistoryLog = this._store.selectSnapshot(AppHistoryLogState.selectHistoryLog);
    if (!ipHistoryLog) {
      this.getData()
        .pipe(take(1))
        .subscribe((logs) => this.dispatch(logs));
    }
  }

  activateLiveDataUpdatesHistoryLog() {
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

  dispatch(logs) {
    this._store.dispatch(new SetHistoryLogState(logs));
  }
}

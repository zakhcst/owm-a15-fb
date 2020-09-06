import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { HistoryService } from '../../services/history.service';
import { IHistoryLog } from 'src/app/models/history-log.model';
import { Store } from '@ngxs/store';
import { switchMap } from 'rxjs/operators';
import { SetHistoryLogState } from '../../states/app.actions';
import { AppHistoryLogState } from '../../states/app.state';

@Injectable({
  providedIn: 'root',
})
export class ResolverHistoryLogService implements Resolve<IHistoryLog> {
  constructor(private _history: HistoryService, private _store: Store) {}

  resolve(): Observable<IHistoryLog> | Observable<never> {
    // return this._history.getData();
    const historyLogNGXSSnapshot = this._store.selectSnapshot(AppHistoryLogState.selectHistoryLog);
    if (historyLogNGXSSnapshot) {
      return of(historyLogNGXSSnapshot);
    }
    return this._history.getData().pipe(
      switchMap((historyLog) => this._store.dispatch(new SetHistoryLogState(historyLog))),
      switchMap((state) => of(state.historyLog))
    );
  }
}

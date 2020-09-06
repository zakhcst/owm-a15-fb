import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { OwmStatsService } from '../../services/owm-stats.service';
import { IOwmStats } from '../../models/owm-stats.model';
import { switchMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { SetStatsState } from '../../states/app.actions';
import { AppStatsState } from '../../states/app.state';

@Injectable({
  providedIn: 'root',
})
export class ResolverStatsService implements Resolve<IOwmStats> {
  constructor(private _stats: OwmStatsService, private _store: Store) {}

  resolve(): Observable<IOwmStats> | Observable<never> {
    const statsNGXSSnapshot = this._store.selectSnapshot(AppStatsState.selectStats);
    if (statsNGXSSnapshot) {
      return of(statsNGXSSnapshot);
    }
    return this._stats.getData().pipe(
      switchMap((stats) => this._store.dispatch(new SetStatsState(stats))),
      switchMap((state) => of(state.stats))
    );
  }
}

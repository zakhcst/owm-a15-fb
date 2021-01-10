import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { StatsService } from '../../services/stats.service';

@Injectable({
  providedIn: 'root',
})
export class ResolverStatsService implements Resolve<Boolean> {
  constructor(private _stats: StatsService) {}

  resolve(): Observable<Boolean> | Observable<never> {
    return of(true);
  }
}

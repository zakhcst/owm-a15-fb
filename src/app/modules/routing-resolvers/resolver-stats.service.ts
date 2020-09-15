import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { OwmStatsService } from '../../services/owm-stats.service';

@Injectable({
  providedIn: 'root',
})
export class ResolverStatsService implements Resolve<Boolean> {
  constructor(private _stats: OwmStatsService) {}

  resolve(): Observable<Boolean> | Observable<never> {
    return of(true);
  }
}

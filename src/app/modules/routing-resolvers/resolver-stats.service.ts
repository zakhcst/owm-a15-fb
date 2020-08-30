import { Injectable } from '@angular/core';

import {
  Resolve,
} from '@angular/router';
import { Observable } from 'rxjs';

import { OwmStatsService } from '../../services/owm-stats.service';
import { IOwmStats } from '../../models/owm-stats.model';

@Injectable({
  providedIn: 'root'
})
export class ResolverStatsService implements Resolve<IOwmStats> {
  constructor(private _stats: OwmStatsService) { }

  resolve(): Observable<IOwmStats> | Observable<never> {
    return this._stats.getData();
  }
}


import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { HistoryLogService } from '../../services/history-log.service';

@Injectable({
  providedIn: 'root',
})
export class ResolverHistoryLogService implements Resolve<Boolean> {
  constructor(private _historyLog: HistoryLogService) {}

  resolve(): Observable<Boolean> | Observable<never> {
    return of(true);
  }
}

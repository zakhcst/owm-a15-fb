import { Injectable } from '@angular/core';

import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';

import { HistoryService } from '../../services/history.service';
import { IHistoryLog } from 'src/app/models/history-log.model';

@Injectable({
  providedIn: 'root'
})
export class ResolverHistoryLogService implements Resolve<IHistoryLog> {
  constructor(private _history: HistoryService, private _router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IHistoryLog> | Observable<never> {
    return this._history.getData();
  }
}

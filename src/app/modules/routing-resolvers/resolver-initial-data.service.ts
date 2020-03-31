import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { OwmDataService } from '../../services/owm-data.service';
import { IOwmData } from '../../models/owm-data.model';

@Injectable({ providedIn: 'root' })
export class ResolverInitialDataService implements Resolve<IOwmData> {
  constructor(private _data: OwmDataService, private _router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<IOwmData> | Observable<never> {
    return this._data.dataRefreshTrigger().pipe(take(1));
  }
}

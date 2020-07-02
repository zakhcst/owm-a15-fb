import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take, switchMap, tap } from 'rxjs/operators';
import { IOwmDataModel } from '../../models/owm-data.model';
import { Store } from '@ngxs/store';
import { GetBrowserIpService } from 'src/app/services/get-browser-ip.service';
import { SetStatusIpState } from 'src/app/states/app.actions';

@Injectable({ providedIn: 'root' })
export class ResolverInitialDataService implements Resolve<IOwmDataModel> {
  constructor(
    private _store: Store,
    private _ip$: GetBrowserIpService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._store.dispatch([new SetStatusIpState('')]);
  }
}

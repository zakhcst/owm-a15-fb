import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { IOwmDataModel } from '../../models/owm-data.model';
import { Store } from '@ngxs/store';
import { GetBrowserIpService } from 'src/app/services/get-browser-ip.service';
import { SetStatusIpState } from 'src/app/states/app.actions';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ResolverInitialDataService implements Resolve<IOwmDataModel> {
  constructor(
    private _store: Store,
    private _ip: GetBrowserIpService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this._ip.requestIPv4()
      .pipe(
        switchMap(this._ip.validateIPv4),
        tap(ip => this._store.dispatch([new SetStatusIpState(ip)]))
      );
  }

}

import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { GetBrowserIpService } from '../../services/get-browser-ip.service';
import { Store } from '@ngxs/store';
import { SetStatusIpState } from 'src/app/states/app.actions';

@Injectable({
  providedIn: 'root',
})
export class ResolverIpService implements Resolve<string> {
  constructor(private _store: Store, private _ip: GetBrowserIpService) {}

  resolve(): Observable<string> | Observable<never> {
    return this._ip.getIPv4().pipe(
      catchError((errIp) => {
        return of('255.255.255.255');
      }),
      switchMap((ip: string) => this._store.dispatch([new SetStatusIpState(ip)]))
    );
  }
}

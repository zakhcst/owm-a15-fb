import { Injectable } from '@angular/core';

import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { GetBrowserIpService } from '../../services/get-browser-ip.service';

@Injectable({
  providedIn: 'root'
})
export class ResolverIpService implements Resolve<string> {
  constructor(private _ip: GetBrowserIpService,  private _router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> | Observable<never> {
    // console.log('ResolverIpService');
    return this._ip.getIP().pipe(
      shareReplay(1)
    );
  }
}

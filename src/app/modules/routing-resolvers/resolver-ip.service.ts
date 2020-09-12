import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GetBrowserIpService } from '../../services/get-browser-ip.service';

@Injectable({
  providedIn: 'root',
})
export class ResolverIpService implements Resolve<any> {
  constructor(private _ip: GetBrowserIpService) { }
  resolve(): Observable<any> | Observable<never> {
    return of(true);
  }
}

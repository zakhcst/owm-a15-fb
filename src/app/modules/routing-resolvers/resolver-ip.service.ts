import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResolverIpService implements Resolve<any> {

  resolve(): Observable<any> | Observable<never> {
    return of(true);
  }
}

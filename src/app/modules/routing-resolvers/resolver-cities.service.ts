import { Injectable } from '@angular/core';

import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { CitiesService } from '../../services/cities.service';
import { ICities } from '../../models/cities.model';

@Injectable({
  providedIn: 'root'
})
export class ResolverCitiesService implements Resolve<ICities> {
  constructor(private _cities: CitiesService, private _router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ICities> | Observable<never> {
    return this._cities.getData().pipe(take(1));
  }
}

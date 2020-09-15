import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CitiesService } from '../../services/cities.service';

@Injectable({
  providedIn: 'root',
})
export class ResolverCitiesService implements Resolve<Boolean> {

  constructor(private _cities: CitiesService) {}

  resolve(): Observable<Boolean> | Observable<never> {
    return of(true);
  }
}

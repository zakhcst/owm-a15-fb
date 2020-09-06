import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { CitiesService } from '../../services/cities.service';
import { ICities } from '../../models/cities.model';
import { Store } from '@ngxs/store';
import { SetCitiesState } from 'src/app/states/app.actions';
import { AppCitiesState } from 'src/app/states/app.state';

@Injectable({
  providedIn: 'root',
})
export class ResolverCitiesService implements Resolve<ICities> {

  constructor(private _cities: CitiesService, private _store: Store) {}

  resolve(): Observable<ICities> | Observable<never> {
    const citiesNGXSSnapshot = this._store.selectSnapshot(AppCitiesState.selectCities);
    if (citiesNGXSSnapshot) {
      return of(citiesNGXSSnapshot);
    }
    return this._cities.getData().pipe(
      switchMap((cities) => this._store.dispatch(new SetCitiesState(cities))),
      switchMap((state) => of(state.cities)),
    );
  }
}

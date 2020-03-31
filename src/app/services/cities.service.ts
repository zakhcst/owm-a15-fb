import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from, Observable, throwError, combineLatest, of } from 'rxjs';
import {
  switchMap,
  take,
  shareReplay,
  catchError,
  takeLast
} from 'rxjs/operators';
import { ICities } from '../models/cities.model';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {
  constructor(private _db: AngularFireDatabase) { }

  getData(): Observable<ICities> {
    return this._db
      .object<ICities>('/cities')
      .valueChanges()
      .pipe(
        take(1),
        shareReplay(1)
      );
  }

  updateReads(cityId: string) {
    if (!cityId) {
      return throwError('CitiesService: updateReads: CityId not provided');
    }
    const ref = this._db.object(`/stats/${cityId}`);
    return ref.valueChanges().pipe(
      take(1),
      switchMap((city: any) => {
        return from(ref.update({ reads: (city && city.reads || 0) + 1 }));
      }),
      catchError(err => {
        console.log(err);
        return throwError('CitiesService: updateReads: ' + err);
      })
    );
  }
}

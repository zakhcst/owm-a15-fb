import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { ConstantsService } from './constants.service';
@Injectable({
  providedIn: 'root',
})
export class StatsUpdateService {
  constructor(private _db: AngularFireDatabase) {}

  updateStatsDBRequests(cityId: string) {
    if (!cityId) {
      return throwError('StatsUpdateService: updateReads: CityId not provided');
    }
    const path = ConstantsService.stats + '/' + cityId;
    const ref = this._db.object(path);
    return ref.valueChanges().pipe(
      take(1),
      switchMap((city: any) => {
        const newValue = ((city && city.r) || 0) + 1;
        console.log('StatsUpdateService:updateStatsDBRequests:', path, city?.r, newValue);
        return from(ref.update({ r: newValue })).pipe(catchError((err) => {
          console.log('Error StatsUpdateService:updateStatsDBRequests:', path, city?.r, newValue);
          return throwError(err);
        }));
      }),
      catchError((err) => {
        console.log(err);
        return throwError('StatsUpdateService:updateStatsDBRequests: ' + err);
      })
    ).subscribe();
  }

}

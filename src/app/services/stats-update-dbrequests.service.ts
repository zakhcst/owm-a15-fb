import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { ConstantsService } from './constants.service';
import { ErrorsService } from './errors.service';
@Injectable({
  providedIn: 'root',
})
export class StatsUpdateService {
  constructor(private _db: AngularFireDatabase, private _errors: ErrorsService) {}

  updateStatsDBRequests(cityId: string) {
    if (!cityId) {
      this.addError('CityId not provided');
      return;
    }
    const path = ConstantsService.stats + '/' + cityId;
    const ref = this._db.object(path);
    let newValue: number;
    let cityR: number | null;
    return ref
      .valueChanges()
      .pipe(
        take(1),
        switchMap((city: any) => {
          cityR = city && city.r;
          newValue = (cityR || 0) + 1;
          return from(ref.update({ r: newValue }));
        })
      )
      .subscribe(() => {},
        (error) => {
          this.addError(path + ' ' + cityR + ' ' + newValue + ' ' + error);
        }
      );
  }

  addError(error: string) {
    const messages = {
      userMessage: 'StatsUpdateService: updateReads: Please reload or try later.',
      logMessage: 'StatsUpdateService: updateReads: ' + error,
    };
    console.log(error);
    this._errors.add(messages);
  }
}

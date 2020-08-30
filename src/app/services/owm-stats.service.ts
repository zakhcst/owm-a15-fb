import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { IOwmStats } from '../models/owm-stats.model';
@Injectable({
  providedIn: 'root'
})

export class OwmStatsService {
  constructor(
    private _db: AngularFireDatabase,
    private _errors: ErrorsService
  ) { }

  getData(): Observable<IOwmStats> {
    return this._db
      .object('/stats')
      .valueChanges()
      .pipe(take(1),
        catchError(err => {
          this._errors.add({
            userMessage: 'Connection or service problem',
            logMessage: 'OwmStatsService ' + err.message
          });
          return throwError(new Error(err));
        })
      );
  }
}

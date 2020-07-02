import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { HistoryRecordModel, AppHistoryPayloadModel } from '../states/app.models';
import { Store } from '@ngxs/store';
import { SetHistoryState } from '../states/app.actions';
import { IHistoryLog } from '../models/history-log.model';
import { Observable } from 'rxjs';
import { take, shareReplay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  constructor(private _db: AngularFireDatabase, private _store: Store) {}

  getData(): Observable<IHistoryLog> {
    return this._db
      .object<IHistoryLog>(ConstantsService.historyLog)
      .valueChanges()
      .pipe(
        take(1),
        shareReplay(1)
      );
  }

  setDataToFB(ip: string, data: HistoryRecordModel) {
    const refKey =
      ConstantsService.historyLog +
      '/' +
      ip.replace(/\.|\:/g, '-') +
      '/' +
      data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.cityId);
  }
}

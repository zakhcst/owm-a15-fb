import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { HistoryRecordModel } from '../states/app.models';
import { IHistoryLog } from '../models/history-log.model';
import { Observable } from 'rxjs';
import { take, shareReplay } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private _db: AngularFireDatabase) {}

  getData(): Observable<IHistoryLog> {
    return this._db.object<IHistoryLog>(ConstantsService.historyLog).valueChanges().pipe(take(1), shareReplay(1));
  }

  setDataToFB(normIp: string, data: HistoryRecordModel) {
    const refKey = ConstantsService.historyLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.cityId);
  }
}

import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { HistoryRecordModel } from '../states/app.models';
@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private _db: AngularFireDatabase) {}

  setDataToFB(normIp: string, data: HistoryRecordModel) {
    const refKey = ConstantsService.historyLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.cityId);
  }
}

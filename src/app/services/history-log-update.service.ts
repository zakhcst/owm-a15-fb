import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { HistoryLogModel } from '../states/app.models';
@Injectable({
  providedIn: 'root',
})
export class HistoryLogUpdateService {
  constructor(private _db: AngularFireDatabase) {}

  setDataToFB(normIp: string, data: HistoryLogModel) {
    const refKey = ConstantsService.historyLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.cityId);
  }
}

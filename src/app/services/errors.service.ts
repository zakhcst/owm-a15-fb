import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { Store } from '@ngxs/store';
import { SetErrorsState } from '../states/app.actions';
import { AppErrorPayloadModel, ErrorRecordModel } from '../states/app.models';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  constructor(private _db: AngularFireDatabase, private _store: Store) {}

  setDataToFB(normIp: string, data: ErrorRecordModel) {
    const refKey = ConstantsService.errorsLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.logMessage);
  }

  add(messages: AppErrorPayloadModel) {
    return this._store.dispatch(new SetErrorsState(messages));
  }
}

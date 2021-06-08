import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { Store } from '@ngxs/store';
import { SetErrorsState, SetPopupMessage } from '../states/app.actions';
import { AppErrorModel, ErrorLogModel, ErrorRecordModel } from '../states/app.models';
import { Observable } from 'rxjs';
import { AppStatusState } from '../states/app.state';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  constructor(private _db: AngularFireDatabase, private _store: Store) {}

  getData(): Observable<ErrorLogModel> {
    return this._db.object<ErrorLogModel>(ConstantsService.errorsLog).valueChanges();
  }

  setDataToFB(normIp: string, data: ErrorRecordModel) {
    const refKey = ConstantsService.errorsLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.logMessage);
  }

  add(messages: AppErrorModel) {
    const normalizedIp = this._store.selectSnapshot(AppStatusState.selectStatusNormalizedIp);
    const ip = this._store.selectSnapshot(AppStatusState.selectStatusIp);
    const newEntry: ErrorRecordModel = {
      logMessage: messages.logMessage,
      time: new Date().valueOf(),
      ip,
    };
    this._store.dispatch(new SetErrorsState(newEntry));
    this._store.dispatch(new SetPopupMessage({
      message: `Error: ${messages.userMessage}`,
      class: 'popup__error',
    }));

    return this.setDataToFB(normalizedIp, newEntry);
  }
}

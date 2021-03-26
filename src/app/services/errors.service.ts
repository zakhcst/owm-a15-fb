import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ConstantsService } from './constants.service';
import { Store } from '@ngxs/store';
import { SetErrorsState } from '../states/app.actions';
import { AppErrorPayloadModel, ErrorLogModel, ErrorRecordModel } from '../states/app.models';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  constructor(private _db: AngularFireDatabase, private _store: Store) {}


  getData(): Observable<ErrorLogModel> {
    return this._db.object<ErrorLogModel>(ConstantsService.errorsLog).valueChanges().pipe(catchError(error => {
      this.add({
        userMessage: 'Connection or service problem',
        logMessage: 'ErrorsService: getData: ' + error,
      });
      return of(error);
    }));
  }

  setDataToFB(normIp: string, data: ErrorRecordModel) {
    const refKey = ConstantsService.errorsLog + '/' + normIp + '/' + data.time;
    const ref = this._db.object(refKey);
    return ref.set(data.logMessage);
  }

  add(messages: AppErrorPayloadModel) {
    return this._store.dispatch(new SetErrorsState(messages));
  }
}

import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { SetHistoryState, SetErrorsState, SetDataState } from './app.actions';
import {
  AppHistoryModel,
  HistoryRecordModel,
  AppErrorsStateModel,
  ErrorRecordModel
} from './app.models';
import { GetBrowserIpService } from '../services/get-browser-ip.service';
import { SnackbarService } from '../services/snackbar.service';
import { switchMap } from 'rxjs/operators';
import { HistoryService } from '../services/history.service';
import { ErrorsService } from '../services/errors.service';
import { IOwmData } from '../models/owm-data.model';

const defaultActivity = {
  ip: '',
  sessionHistory: [
    {
      cityId: 'Init',
      time: new Date().valueOf()
    }
  ]
};

@State<AppHistoryModel>({
  name: 'activity',
  defaults: defaultActivity
})
@Injectable()
export class AppHistoryState {
  constructor(
    private _ip: GetBrowserIpService,
    private _history: HistoryService,
    private _snackbar: SnackbarService
  ) {}

  @Action(SetHistoryState)
  setHistoryState(
    context: StateContext<AppHistoryModel>,
    action: SetHistoryState
  ) {
    const { cityId, cityName, countryISO2 } = action.payload;
    return this._ip.getIP().pipe(
      switchMap(ip => {
        const newEntry: HistoryRecordModel = {
          cityId,
          time: new Date().valueOf()
        };
        const update = {
          ip,
          sessionHistory: [...context.getState().sessionHistory, newEntry]
        };

        context.patchState(update);
        localStorage.setItem('lastCityId', cityId);

        this._snackbar.show({
          message: `Selected: ${cityName}, ${countryISO2}`,
          class: 'snackbar__info'
        });
        return this._history.setDataToFB(ip, newEntry);
      })
    );
  }
}

const defaultErrorsRecord = {
  ip: '',
  sessionErrors: [
    {
      logMessage: 'Init',
      time: new Date().valueOf()
    }
  ]
};

@State<AppErrorsStateModel>({
  name: 'errors',
  defaults: defaultErrorsRecord
})
@Injectable()
export class AppErrorsState {
  constructor(
    private _ip: GetBrowserIpService,
    private _errors: ErrorsService,
    private _snackbar: SnackbarService
  ) {}

  @Action(SetErrorsState)
  setErrorsState(
    context: StateContext<AppErrorsStateModel>,
    action: SetErrorsState
  ) {
    return this._ip.getIP().pipe(
      switchMap(ip => {
        const newEntry: ErrorRecordModel = {
          logMessage: action.payload.logMessage,
          time: new Date().valueOf()
        };
        const update = {
          ip,
          sessionErrors: [...context.getState().sessionErrors, newEntry]
        };
        context.patchState(update);
        this._snackbar.show({
          message: `Error: ${action.payload.userMessage}`,
          class: 'snackbar__error'
        });
        return this._errors.setDataToFB(ip, newEntry);
      })
    );
  }
}

@State<IOwmData>({
  name: 'data',
  defaults: null
})
@Injectable()
export class AppDataState {
  constructor() {}

  @Action(SetDataState)
  setDataState(context: StateContext<IOwmData>, action: SetDataState) {
    context.setState(action.payload);
  }
}

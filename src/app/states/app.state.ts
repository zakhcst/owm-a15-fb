import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  SetHistoryState,
  SetErrorsState,
  SetDataState,
  SetStatusSelectedCityIdState,
  SetStatusIpState,
  SetStatusTimeSlotBgPicture,
  SetStatusThreeDayForecast,
} from './app.actions';
import { AppStatusModel, AppErrorsStateModel, HistoryRecordModel, ErrorRecordModel, IHistoryModel } from './app.models';
import { GetBrowserIpService } from '../services/get-browser-ip.service';
import { SnackbarService } from '../services/snackbar.service';
import { switchMap } from 'rxjs/operators';
import { HistoryService } from '../services/history.service';
import { ErrorsService } from '../services/errors.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { ConstantsService } from '../services/constants.service';
import { DataService } from '../services/data.service';

@State<AppStatusModel>({
  name: 'status',
  defaults: {
    ip: 'init',
    sessionStartTime: new Date().valueOf(),
    selectedCityId: ConstantsService.defaultCityId,
    threeDayForecast: false,
    timeSlotBgPicture: false,
  },
})
@Injectable()
export class AppStatusState {
  constructor(private _ip: GetBrowserIpService) {}

  @Selector()
  static selectStatusSelectedCityId(state: AppStatusModel) {
    return state.selectedCityId;
  }

  @Selector()
  static selectStatusIp(state: AppStatusModel) {
    return state.ip;
  }
  
  @Selector()
  static timeSlotBgPicture(state: AppStatusModel) {
    return state.timeSlotBgPicture;
  }

  @Selector()
  static threeDayForecast(state: AppStatusModel) {
    return state.threeDayForecast;
  }

  @Action(SetStatusIpState)
  setStatusIpState(context: StateContext<AppStatusModel>, action: SetStatusIpState) {
    return context.patchState({ ip: action.payload });
  }

  @Action(SetStatusSelectedCityIdState)
  setStatusSelectedCityIdState(context: StateContext<AppStatusModel>, action: SetStatusSelectedCityIdState) {
    const selectedCityId = action.payload || context.getState().selectedCityId;
    localStorage.setItem('selectedCityId', selectedCityId);
    context.patchState({ selectedCityId });
  }

  @Action(SetStatusTimeSlotBgPicture)
  setStatusTimeSlotBgPicture(context: StateContext<AppStatusModel>, action: SetStatusTimeSlotBgPicture) {
    return context.patchState({ timeSlotBgPicture: action.payload });
  }

  @Action(SetStatusThreeDayForecast)
  setStatusThreeDayForecast(context: StateContext<AppStatusModel>, action: SetStatusThreeDayForecast) {
    return context.patchState({ threeDayForecast: action.payload });
  }
}

@State<IHistoryModel>({
  name: 'history',
  defaults: [],
})
@Injectable()
export class AppHistoryState {
  constructor(
    private _store: Store,
    private _history: HistoryService,
    private _snackbar: SnackbarService,
    private _fb: DataService
  ) {}

  @Selector([AppStatusState])
  static selectSelectedCityHistory(state: IHistoryModel, status: AppStatusModel): IHistoryModel {
    return state.filter((snapshot) => {
      return snapshot.city.id.toString() === status.selectedCityId.toString();
    });
  }

  @Selector([AppHistoryState.selectSelectedCityHistory])
  static selectSelectedCityHistoryLast(state: IOwmDataModel, cityHistory: IHistoryModel) {
    return cityHistory.slice(-1)[0];
  }

  @Action(SetHistoryState)
  setHistoryState(context: StateContext<IHistoryModel>, action: SetHistoryState) {
    const owmData = action.payload.owmData;

    const selectedCityId = owmData.city.id.toString();
    const cityName = owmData.city.name;
    const countryISO2 = owmData.city.country;
    const ip = this._store.selectSnapshot(AppStatusState.selectStatusIp);

    const newEntry: HistoryRecordModel = {
      cityId: selectedCityId,
      time: new Date().valueOf(),
    };

    // Reuse exising snapshot
    const existingSnapshot = context.getState().find(snapshot => snapshot.updated === owmData.updated);
    const sessionHistory = [...context.getState(), existingSnapshot || owmData];

    context.setState(sessionHistory);

    this._snackbar.show({
      message: `Selected: ${cityName}, ${countryISO2}`,
      class: 'snackbar__info',
    });
    return this._history.setDataToFB(ip, newEntry).then(() => {
      if (!existingSnapshot) {
        return this._fb.setData(selectedCityId, owmData);
      }
    });
  }
}

const defaultErrorsRecord = {
  ip: '',
  sessionErrors: [
    {
      logMessage: 'Init',
      time: new Date().valueOf(),
    },
  ],
};

@State<AppErrorsStateModel>({
  name: 'errors',
  defaults: defaultErrorsRecord,
})
@Injectable()
export class AppErrorsState {
  constructor(private _ip: GetBrowserIpService, private _errors: ErrorsService, private _snackbar: SnackbarService) {}

  @Action(SetErrorsState)
  setErrorsState(context: StateContext<AppErrorsStateModel>, action: SetErrorsState) {
    return this._ip.getIP().pipe(
      switchMap((ip) => {
        const newEntry: ErrorRecordModel = {
          logMessage: action.payload.logMessage,
          time: new Date().valueOf(),
        };
        const update = {
          ip,
          sessionErrors: [...context.getState().sessionErrors, newEntry],
        };
        context.patchState(update);
        this._snackbar.show({
          message: `Error: ${action.payload.userMessage}`,
          class: 'snackbar__error',
        });
        return this._errors.setDataToFB(ip, newEntry);
      })
    );
  }
}

@State<IOwmDataModel>({
  name: 'data',
  defaults: null,
})
@Injectable()
export class AppOwmDataState {
  @Selector()
  static selectOwmData(state: IOwmDataModel) {
    return state;
  }

  @Action(SetDataState)
  setDataState(context: StateContext<IOwmDataModel>, action: SetDataState) {
    const owmData = action.payload;
    context.setState(owmData);
    return context.dispatch(new SetHistoryState({ owmData }));
  }
}

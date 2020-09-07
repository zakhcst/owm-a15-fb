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
  SetCitiesState,
  SetStatsState,
  SetHistoryLogState,
  SetStatusConnected,
  SetStatusAway,
} from './app.actions';
import { AppStatusModel, AppErrorsStateModel, HistoryRecordModel, ErrorRecordModel, IHistoryModel } from './app.models';
import { SnackbarService } from '../services/snackbar.service';
import { HistoryService } from '../services/history.service';
import { ErrorsService } from '../services/errors.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { ConstantsService } from '../services/constants.service';
import { DataService } from '../services/data.service';
import { NormalizeDataService } from '../services/normalize-data.service';
import { ICities } from '../models/cities.model';
import { IOwmStats } from '../models/owm-stats.model';
import { IHistoryLog } from '../models/history-log.model';

@State<AppStatusModel>({
  name: 'status',
  defaults: {
    ip: '--ip',
    normalizedIp: '--ip',
    sessionStartTime: new Date().valueOf(),
    selectedCityId: ConstantsService.defaultCityId,
    threeDayForecast: false,
    timeSlotBgPicture: false,
    connected: true,
    away: false,
  },
})
@Injectable()
export class AppStatusState {
  constructor(private normalizedData: NormalizeDataService) { }

  @Selector()
  static selectStatusSelectedCityId(state: AppStatusModel) {
    return state.selectedCityId;
  }

  @Selector()
  static selectStatusIp(state: AppStatusModel) {
    return state.ip;
  }
  @Selector()
  static selectStatusNormalizedIp(state: AppStatusModel) {
    return state.normalizedIp;
  }

  @Selector()
  static timeSlotBgPicture(state: AppStatusModel) {
    return state.timeSlotBgPicture;
  }

  @Selector()
  static threeDayForecast(state: AppStatusModel) {
    return state.threeDayForecast;
  }

  @Selector()
  static connected(state: AppStatusModel) {
    return state.connected;
  }

  @Selector()
  static away(state: AppStatusModel) {
    return state.away;
  }

  @Action(SetStatusIpState)
  setStatusIpState(context: StateContext<AppStatusModel>, action: SetStatusIpState) {
    const ip = action.payload;
    const normalizedIp = this.normalizedData.ip(ip);
    return context.patchState({ ip, normalizedIp });
  }

  @Action(SetStatusSelectedCityIdState)
  setStatusSelectedCityIdState(context: StateContext<AppStatusModel>, action: SetStatusSelectedCityIdState) {
    const selectedCityId = action.payload || context.getState().selectedCityId;
    localStorage.setItem('selectedCityId', selectedCityId);
    context.patchState({ selectedCityId });
  }

  @Action(SetStatusTimeSlotBgPicture)
  setStatusTimeSlotBgPicture(context: StateContext<AppStatusModel>, action: SetStatusTimeSlotBgPicture) {
    context.patchState({ timeSlotBgPicture: action.payload });
  }

  @Action(SetStatusThreeDayForecast)
  setStatusThreeDayForecast(context: StateContext<AppStatusModel>, action: SetStatusThreeDayForecast) {
    context.patchState({ threeDayForecast: action.payload });
  }

  @Action(SetStatusConnected)
  setStatusConnected(context: StateContext<AppStatusModel>, action: SetStatusConnected) {
    context.patchState({ connected: action.payload });
  }

  @Action(SetStatusAway)
  setStatusAway(context: StateContext<AppStatusModel>, action: SetStatusAway) {
    context.patchState({ away: action.payload });
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
  ) { }

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
    const normalizedIp = this._store.selectSnapshot(AppStatusState.selectStatusNormalizedIp);

    const newEntry: HistoryRecordModel = {
      cityId: selectedCityId,
      time: new Date().valueOf(),
    };

    // Reuse exising snapshot
    const existingSnapshot = context.getState().find((snapshot) => snapshot.updated === owmData.updated);
    const sessionHistory = [...context.getState(), existingSnapshot || owmData];

    context.setState(sessionHistory);

    this._snackbar.show({
      message: `Selected: ${cityName}, ${countryISO2}`,
      class: 'snackbar__info',
    });
    return this._history.setDataToFB(normalizedIp, newEntry).then(() => {
      if (!existingSnapshot) {
        return this._fb.setData(selectedCityId, owmData);
      }
    });
  }
}

const defaultErrorsRecord = {
  sessionErrors: [
    {
      logMessage: 'Init',
      time: new Date().valueOf(),
      ip: ''
    },
  ],
};

@State<AppErrorsStateModel>({
  name: 'errors',
  defaults: defaultErrorsRecord,
})
@Injectable()
export class AppErrorsState {
  constructor(
    private _errors: ErrorsService,
    private _snackbar: SnackbarService,
    private _store: Store
  ) { }

  @Action(SetErrorsState)
  setErrorsState(context: StateContext<AppErrorsStateModel>, action: SetErrorsState) {
    const normalizedIp = this._store.selectSnapshot(AppStatusState.selectStatusNormalizedIp);
    const ip = this._store.selectSnapshot(AppStatusState.selectStatusIp);
    const newEntry: ErrorRecordModel = {
      logMessage: action.payload.logMessage,
      time: new Date().valueOf(),
      ip
    };
    const update = {
      sessionErrors: [...context.getState().sessionErrors, newEntry],
    };
    context.patchState(update);
    this._snackbar.show({
      message: `Error: ${action.payload.userMessage}`,
      class: 'snackbar__error',
    });
    return this._errors.setDataToFB(normalizedIp, newEntry);
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

@State<ICities>({
  name: 'cities',
  defaults: null,
})
@Injectable()
export class AppCitiesState {
  @Selector()
  static selectCities(state: ICities) {
    return state;
  }

  @Action(SetCitiesState)
  setCitiesState(context: StateContext<ICities>, action: SetCitiesState) {
    context.setState(action.payload);
  }
}

@State<IOwmStats>({
  name: 'stats',
  defaults: null,
})
@Injectable()
export class AppStatsState {
  @Selector()
  static selectStats(state: IOwmStats) {
    return state;
  }

  @Action(SetStatsState)
  setStatsState(context: StateContext<IOwmStats>, action: SetStatsState) {
    context.setState(action.payload);
  }
}

@State<IHistoryLog>({
  name: 'historyLog',
  defaults: null,
})
@Injectable()
export class AppHistoryLogState {
  @Selector()
  static selectHistoryLog(state: IHistoryLog) {
    return state;
  }

  @Action(SetHistoryLogState)
  setStatsState(context: StateContext<IHistoryLog>, action: SetHistoryLogState) {
    context.setState(action.payload);
  }
}

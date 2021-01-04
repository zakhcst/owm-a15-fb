import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  SetHistoryState,
  SetErrorsState,
  SetDataState,
  SetStatusSelectedCityIdState,
  SetStatusIpState,
  SetStatusTimeSlotBgPicture,
  SetCitiesState,
  SetStatsState,
  SetHistoryLogState,
  SetStatusConnected,
  SetStatusAway,
  SetFallbackDataState,
  SetStatusUpdatesAvailable,
  SetStatusLiveDataUpdate,
  SetStatusDaysForecast,
  SetStatusShowDetailPressure,
  SetStatusShowDetailHumidity,
  SetStatusShowDetailWind,
  SetStatusShowDetailSecondary,
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
    timeSlotBgPicture: false,
    connected: true,
    away: false,
    updatesAvailable: false,
    liveDataUpdate: false,
    daysForecast: 5,
    showDetailPressure: true,
    showDetailWind: true,
    showDetailHumidity: true,
    showDetailSecondary: true,
  },
})
@Injectable()
export class AppStatusState {
  constructor(private normalizedData: NormalizeDataService) {}

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
  static connected(state: AppStatusModel) {
    return state.connected;
  }

  @Selector()
  static away(state: AppStatusModel) {
    return state.away;
  }

  @Selector()
  static updatesAvailable(state: AppStatusModel) {
    return state.updatesAvailable;
  }

  @Selector()
  static liveDataUpdate(state: AppStatusModel) {
    return state.liveDataUpdate;
  }

  @Selector()
  static daysForecast(state: AppStatusModel) {
    return state.daysForecast;
  }

  @Selector()
  static showDetailPressure(state: AppStatusModel) {
    return state.showDetailPressure;
  }
  @Selector()
  static showDetailWind(state: AppStatusModel) {
    return state.showDetailWind;
  }
  @Selector()
  static showDetailHumidity(state: AppStatusModel) {
    return state.showDetailHumidity;
  }
  @Selector()
  static showDetailSecondary(state: AppStatusModel) {
    return state.showDetailSecondary;
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

  @Action(SetStatusDaysForecast)
  setStatusDaysForecast(context: StateContext<AppStatusModel>, action: SetStatusDaysForecast) {
    context.patchState({ daysForecast: action.payload });
  }

  @Action(SetStatusConnected)
  setStatusConnected(context: StateContext<AppStatusModel>, action: SetStatusConnected) {
    context.patchState({ connected: action.payload });
  }

  @Action(SetStatusAway)
  setStatusAway(context: StateContext<AppStatusModel>, action: SetStatusAway) {
    context.patchState({ away: action.payload });
  }

  @Action(SetStatusUpdatesAvailable)
  setStatusUpdatesAvailable(context: StateContext<AppStatusModel>, action: SetStatusUpdatesAvailable) {
    context.patchState({ updatesAvailable: action.payload });
  }

  @Action(SetStatusLiveDataUpdate)
  setStatusLiveDataUpdate(context: StateContext<AppStatusModel>, action: SetStatusLiveDataUpdate) {
    context.patchState({ liveDataUpdate: action.payload });
  }
  @Action(SetStatusShowDetailPressure)
  setStatusShowDetailPressure(context: StateContext<AppStatusModel>, action: SetStatusShowDetailPressure) {
    context.patchState({ showDetailPressure: action.payload });
    context.dispatch(new SetStatusShowDetailSecondary('showDetailPressure'));
  }
  @Action(SetStatusShowDetailWind)
  setStatusShowDetailWind(context: StateContext<AppStatusModel>, action: SetStatusShowDetailWind) {
    context.patchState({ showDetailWind: action.payload });
    context.dispatch(new SetStatusShowDetailSecondary('showDetailWind'));
  }
  @Action(SetStatusShowDetailHumidity)
  setStatusShowSetStatusShowDetailHumidity(context: StateContext<AppStatusModel>, action: SetStatusShowDetailHumidity) {
    context.patchState({ showDetailHumidity: action.payload });
    context.dispatch(new SetStatusShowDetailSecondary('showDetailHumidity'));
  }
  @Action(SetStatusShowDetailSecondary)
  setStatusShowSetStatusShowDetailSecondary(
    context: StateContext<AppStatusModel>,
    action: SetStatusShowDetailSecondary
  ) {
    const state = context.getState();
    const display = state.showDetailPressure || state.showDetailWind || state.showDetailHumidity;
    context.patchState({ showDetailSecondary: display });
    document.documentElement.style.setProperty('--' + action.payload, state[action.payload] ? 'flex' : 'none');
    document.documentElement.style.setProperty('--showDetailSecondary', display ? 'flex' : 'none');
  }
}

@State<IHistoryModel>({
  name: 'history',
  defaults: {},
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
  static selectSelectedCityHistoryLast(state: IOwmDataModel, status: AppStatusModel) {
    return state[status.selectedCityId];
  }

  @Action(SetHistoryState)
  setHistoryState(context: StateContext<IHistoryModel>, action: SetHistoryState) {
    const owmData = action.payload.owmData;

    // const selectedCityId = owmData.city.id.toString();
    const cityName = owmData.city.name;
    const countryISO2 = owmData.city.country;
    const normalizedIp = this._store.selectSnapshot(AppStatusState.selectStatusNormalizedIp);
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);

    const newEntry: HistoryRecordModel = {
      cityId: selectedCityId,
      time: new Date().valueOf(),
    };

    const existingSnapshot = context.getState()[selectedCityId];
    let updateOwmDataToFB;
    if (owmData.updated && (!existingSnapshot || existingSnapshot.updated !== owmData.updated)) {
      const update = { ...context.getState(), [selectedCityId]: owmData };
      context.setState(update);
      updateOwmDataToFB = this._fb.setData(selectedCityId, owmData);
    }

    this._snackbar.show({
      message: `Selected: ${cityName}, ${countryISO2}`,
      class: 'snackbar__info',
    });
    return Promise.all([this._history.setDataToFB(normalizedIp, newEntry), updateOwmDataToFB]);
  }
}

const defaultErrorsRecord = {
  sessionErrors: [
    {
      logMessage: 'Init',
      time: new Date().valueOf(),
      ip: '',
    },
  ],
};

@State<AppErrorsStateModel>({
  name: 'errors',
  defaults: defaultErrorsRecord,
})
@Injectable()
export class AppErrorsState {
  constructor(private _errors: ErrorsService, private _snackbar: SnackbarService, private _store: Store) {}

  @Action(SetErrorsState)
  setErrorsState(context: StateContext<AppErrorsStateModel>, action: SetErrorsState) {
    const normalizedIp = this._store.selectSnapshot(AppStatusState.selectStatusNormalizedIp);
    const ip = this._store.selectSnapshot(AppStatusState.selectStatusIp);
    const newEntry: ErrorRecordModel = {
      logMessage: action.payload.logMessage,
      time: new Date().valueOf(),
      ip,
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

@State<IOwmDataModel>({
  name: 'fallbackData',
  defaults: null,
})
@Injectable()
export class AppFallbackDataState {
  @Selector()
  static selectFallbackData(state: IHistoryLog) {
    return state;
  }

  @Action(SetFallbackDataState)
  setFallbackDataState(context: StateContext<IOwmDataModel>, action: SetFallbackDataState) {
    context.setState(action.payload);
  }
}

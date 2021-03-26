import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import {
  SetOwmDataCacheState,
  SetErrorsState,
  SetCitiesState,
  SetStatsState,
  SetHistoryLogState,
  SetFallbackDataState,
  SetStatusSelectedCityId,
  SetStatusIp,
  SetStatusShowTimeSlotBgPicture,
  SetStatusConnected,
  SetStatusAway,
  SetStatusUpdatesAvailable,
  SetStatusLiveDataUpdate,
  SetStatusDaysForecast,
  SetStatusShowDetailSecondary,
  SetStatusShowDetailPressure,
  SetStatusShowDetailHumidity,
  SetStatusShowDetailWind,
  SetStatusShowGChartHumidity,
  SetStatusShowGChartWind,
  SetStatusShowGChartIcons,
  SetStatusShowLoading,
  SetStatusBuildInfo,
} from './app.actions';
import { AppStatusModel, AppErrorsStateModel, HistoryLogModel, ErrorRecordModel, IOwmDataCacheModel } from './app.models';
import { SnackbarService } from '../services/snackbar.service';
import { HistoryLogUpdateService } from '../services/history-log-update.service';
import { ErrorsService } from '../services/errors.service';
import { IOwmDataModel } from '../models/owm-data.model';
import { ConstantsService } from '../services/constants.service';
import { NormalizeDataService } from '../services/normalize-data.service';
import { ICities } from '../models/cities.model';
import { IStats } from '../models/stats.model';
import { IHistoryLog } from '../models/history-log.model';

@State<AppStatusModel>({
  name: 'status',
  defaults: {
    ip: '--ip',
    normalizedIp: '--ip',
    sessionStartTime: new Date().valueOf(),
    selectedCityId: ConstantsService.defaultCityId,
    connected: true,
    away: false,
    updatesAvailable: false,
    liveDataUpdate: true,
    daysForecast: 5,
    showLoading: false,
    buildInfo: null,

    showDetailTimeSlotBgPicture: true,
    showDetailSecondary: true,
    showDetailPressure: true,
    showDetailWind: true,
    showDetailHumidity: true,
    showGChartWind: true,
    showGChartHumidity: true,
    showGChartIcons: true,
  },
})
@Injectable()
export class AppStatusState {
  constructor(
    private normalizedData: NormalizeDataService,
    private _store: Store,
    private _snackbar: SnackbarService,
  ) { }

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
  static showDetailTimeSlotBgPicture(state: AppStatusModel) {
    return state.showDetailTimeSlotBgPicture;
  }

  @Selector()
  static showLoading(state: AppStatusModel) {
    return state.showLoading;
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
  @Selector()
  static showGChartWind(state: AppStatusModel) {
    return state.showGChartWind;
  }
  @Selector()
  static showGChartHumidity(state: AppStatusModel) {
    return state.showGChartHumidity;
  }
  @Selector()
  static showGChartIcons(state: AppStatusModel) {
    return state.showGChartIcons;
  }

  @Selector()
  static buildInfo(state: AppStatusModel) {
    return state.buildInfo;
  }

  @Action(SetStatusIp)
  setStatusIp(context: StateContext<AppStatusModel>, action: SetStatusIp) {
    const ip = action.payload;
    const normalizedIp = this.normalizedData.ip(ip);
    return context.patchState({ ip, normalizedIp });
  }

  @Action(SetStatusSelectedCityId)
  setStatusSelectedCityId(context: StateContext<AppStatusModel>, action: SetStatusSelectedCityId) {
    const selectedCityId = action.payload || context.getState().selectedCityId;
    const cities = this._store.selectSnapshot(AppCitiesState.selectCities);
    const cityName = cities[selectedCityId].name;
    const countryISO2 = cities[selectedCityId].iso2;
    if (cities && cityName && countryISO2) {
      this._snackbar.show({
        message: `Selected: ${cityName}, ${countryISO2}`,
        class: 'snackbar__info',
      });
    }
    context.patchState({ selectedCityId });
  }

  @Action(SetStatusShowTimeSlotBgPicture)
  setStatusShowTimeSlotBgPicture(context: StateContext<AppStatusModel>, action: SetStatusShowTimeSlotBgPicture) {
    context.patchState({ showDetailTimeSlotBgPicture: action.payload });
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

  @Action(SetStatusShowLoading)
  setStatusShowLoading(context: StateContext<AppStatusModel>, action: SetStatusShowLoading) {
    context.patchState({ showLoading: action.payload });
  }

  @Action(SetStatusShowGChartIcons)
  setStatusShowGChartIcons(context: StateContext<AppStatusModel>, action: SetStatusShowGChartIcons) {
    context.patchState({ showGChartIcons: action.payload });
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
  @Action(SetStatusShowGChartWind)
  setStatusShowGChartWind(context: StateContext<AppStatusModel>, action: SetStatusShowGChartWind) {
    context.patchState({ showGChartWind: action.payload });
  }
  @Action(SetStatusShowGChartHumidity)
  setStatusShowSetStatusShowGChartHumidity(context: StateContext<AppStatusModel>, action: SetStatusShowGChartHumidity) {
    context.patchState({ showGChartHumidity: action.payload });
  }
  @Action(SetStatusBuildInfo)
  setStatusBuildInfo(context: StateContext<AppStatusModel>, action: SetStatusBuildInfo) {
    context.patchState({ buildInfo: action.payload });
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

@State<IOwmDataCacheModel>({
  name: 'owmDataCache',
  defaults: null,
})
@Injectable()
export class AppOwmDataCacheState {
  constructor(
    private _store: Store,
    private _historyLogUpdate: HistoryLogUpdateService,
    private _snackbar: SnackbarService,
  ) { }

  @Selector([AppStatusState, AppFallbackDataState])
  static selectOwmDataCacheSelectedCity(state: IOwmDataModel, status: AppStatusModel, fallbackData: IOwmDataModel) {
    return (state && state[status.selectedCityId]) || fallbackData || null;
  }

  @Action(SetOwmDataCacheState)
  setOwmDataCacheState(context: StateContext<IOwmDataCacheModel>, action: SetOwmDataCacheState) {
    const owmData = action.payload;
    if (!owmData || !owmData.updated) {
      return;
    }
    const updatesPromiseArray = [];
    const selectedCityId = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId);
    const state = context.getState() ?? {};
    const cachedCityOwmData = state[selectedCityId];

    if (!cachedCityOwmData || cachedCityOwmData.updated < owmData.updated) {
      const update = { ...state, [selectedCityId]: owmData };
      context.setState(update);

      const normalizedIp = this._store.selectSnapshot(AppStatusState.selectStatusNormalizedIp);
      const newEntry: HistoryLogModel = {
        cityId: selectedCityId,
        time: new Date().valueOf(),
      };
      updatesPromiseArray.push(this._historyLogUpdate.setDataToFB(normalizedIp, newEntry));

      const cityName = owmData.city.name;
      const countryISO2 = owmData.city.country;
      this._snackbar.show({
        message: `Refreshed: ${cityName}, ${countryISO2}`,
        class: 'snackbar__info',
      });
      return Promise.all(updatesPromiseArray);
    }
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
  constructor(private _errors: ErrorsService, private _snackbar: SnackbarService, private _store: Store) { }

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

@State<IStats>({
  name: 'stats',
  defaults: null,
})
@Injectable()
export class AppStatsState {
  @Selector()
  static selectStats(state: IStats) {
    return state;
  }

  @Action(SetStatsState)
  setStatsState(context: StateContext<IStats>, action: SetStatsState) {
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
  setHistoryLogState(context: StateContext<IHistoryLog>, action: SetHistoryLogState) {
    context.setState(action.payload);
  }
}

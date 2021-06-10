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
  SetPopupMessage,
  SetStatusPopupType,
} from './app.actions';
import {
  AppStatusModel,
  AppErrorsStateModel,
  IOwmDataCacheModel,
} from './app.models';
import { IOwmDataModel } from '../models/owm-data.model';
import { ConstantsService } from '../services/constants.service';
import { NormalizeDataService } from '../services/normalize-data.service';
import { ICities } from '../models/cities.model';
import { IStats } from '../models/stats.model';
import { IHistoryLog } from '../models/history-log.model';
import { IPopupModel, PopupType } from '../models/snackbar.model';

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
    popupType: PopupType.TOAST,
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
  static popupType(state: AppStatusModel) {
    return state.popupType;
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
    context.patchState({ selectedCityId: action.payload });
  }

  @Action(SetStatusShowTimeSlotBgPicture)
  setStatusShowTimeSlotBgPicture(context: StateContext<AppStatusModel>, action: SetStatusShowTimeSlotBgPicture) {
    context.patchState({ showDetailTimeSlotBgPicture: action.payload });
  }

  @Action(SetStatusDaysForecast)
  setStatusDaysForecast(context: StateContext<AppStatusModel>, action: SetStatusDaysForecast) {
    context.patchState({ daysForecast: action.payload });
  }

  @Action(SetStatusPopupType)
  setStatusPopupType(context: StateContext<AppStatusModel>, action: SetStatusPopupType) {
    context.patchState({ popupType: action.payload });
  }

  @Action(SetStatusConnected)
  setStatusConnected(context: StateContext<AppStatusModel>, action: SetStatusConnected) {
    const connected = context.getState().connected;
    if (connected !== action.payload) {
      context.patchState({ connected: action.payload });
    }
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
  static selectFallbackData(state: IOwmDataModel) {
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

  @Selector([AppStatusState, AppFallbackDataState])
  static selectOwmDataCachedOrDefaultSelectedCity(state: IOwmDataModel, status: AppStatusModel, fallbackData: IOwmDataModel) {
    return state?.[status.selectedCityId] || fallbackData || null;
  }

  @Selector([AppStatusState])
  static selectOwmDataCachedSelectedCity(state: IOwmDataModel, status: AppStatusModel) {
    return state?.[status.selectedCityId];
  }

  @Action(SetOwmDataCacheState)
  setOwmDataCacheState(context: StateContext<IOwmDataCacheModel>, action: SetOwmDataCacheState) {
    const owmData = action.payload;
    const selectedCityId = owmData.city.id.toString();
    context.patchState({[selectedCityId]: owmData});
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
  @Action(SetErrorsState)
  setErrorsState(context: StateContext<AppErrorsStateModel>, action: SetErrorsState) {
    const update = {
      sessionErrors: [...context.getState().sessionErrors, action.payload],
    };
    context.setState(update);
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
@State<IPopupModel>({
  name: 'popupMessages',
  defaults: null,
})
@Injectable()
export class AppPopupMessages {
  @Selector()
  static selectPopupMessages(state: IPopupModel) {
    return state;
  }

  @Action(SetPopupMessage)
  setPopupMessage(context: StateContext<IPopupModel>, action: SetPopupMessage) {
    context.setState(action.payload);
  }
}

import { AppHistoryPayloadModel, AppErrorPayloadModel } from './app.models';
import { IOwmDataModel } from '../models/owm-data.model';
import { ICities } from '../models/cities.model';
import { IStats } from '../models/stats.model';
import { IHistoryLog } from '../models/history-log.model';
import { IStatusBuildInfo } from '../models/build-info.model';

export class SetOwmDataCacheState {
  static readonly type = '[owmDataCache] set';
  constructor(public payload: IOwmDataModel) {}
}

export class SetStatusIp {
  static readonly type = '[status] set ip';
  constructor(public payload: string) {}
}

export class SetStatusShowTimeSlotBgPicture {
  static readonly type = '[status] set showDetailTimeSlotBgPicture';
  constructor(public payload: boolean) {}
}

export class SetStatusDaysForecast {
  static readonly type = '[status] set Days Forecast';
  constructor(public payload: number) {}
}

export class SetStatusSelectedCityId {
  static readonly type = '[status] set SelectedCityId';
  constructor(public payload?: string) {}
}

export class SetStatusConnected {
  static readonly type = '[status] set Connected';
  constructor(public payload: boolean) {}
}

export class SetStatusAway {
  static readonly type = '[status] set Away';
  constructor(public payload: boolean) {}
}

export class SetStatusUpdatesAvailable {
  static readonly type = '[status] set Updates Available';
  constructor(public payload: boolean) {}
}

export class SetStatusLiveDataUpdate {
  static readonly type = '[status] set Live Data Update';
  constructor(public payload: boolean) {}
}
export class SetStatusShowLoading {
  static readonly type = '[status] set Show Loading';
  constructor(public payload: boolean) {}
}
export class SetStatusShowGChartIcons {
  static readonly type = '[status] set Show Chart Icons';
  constructor(public payload: boolean) {}
}
export class SetStatusShowDetailSecondary {
  static readonly type = '[status] set Show Detail Secondary';
  constructor(public payload: string) {}
}
export class SetStatusShowDetailPressure {
  static readonly type = '[status] set Show Detail Pressure';
  constructor(public payload: boolean) {}
}
export class SetStatusShowDetailWind {
  static readonly type = '[status] set Show Detail Wind';
  constructor(public payload: boolean) {}
}
export class SetStatusShowDetailHumidity {
  static readonly type = '[status] set Show Detail Humidity';
  constructor(public payload: boolean) {}
}
export class SetStatusShowGChartHumidity {
  static readonly type = '[status] set Show GChart Humidity';
  constructor(public payload: boolean) {}
}
export class SetStatusShowGChartWind {
  static readonly type = '[status] set Show GChart Wind';
  constructor(public payload: boolean) {}
}

export class SetErrorsState {
  static readonly type = '[errors] set';
  constructor(public payload: AppErrorPayloadModel) {}
}

export class SetCitiesState {
  static readonly type = '[cities] set';
  constructor(public payload: ICities) {}
}

export class SetStatsState {
  static readonly type = '[stats] set';
  constructor(public payload: IStats) {}
}

export class SetHistoryLogState {
  static readonly type = '[historyLog] set';
  constructor(public payload: IHistoryLog) {}
}

export class SetFallbackDataState {
  static readonly type = '[fallback data] set';
  constructor(public payload: IOwmDataModel) {}
}
export class SetStatusBuildInfo {
  static readonly type = '[build info] set';
  constructor(public payload: IStatusBuildInfo) {}
}

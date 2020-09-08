import { AppHistoryPayloadModel, AppErrorPayloadModel } from './app.models';
import { IOwmDataModel } from '../models/owm-data.model';
import { ICities } from '../models/cities.model';
import { IOwmStats } from '../models/owm-stats.model';
import { IHistoryLog } from '../models/history-log.model';

export class SetHistoryState {
  static readonly type = '[activity] set history';
  constructor(public payload: AppHistoryPayloadModel) { }
}

export class SetHistoryIpState {
  static readonly type = '[activity] set ip';
  constructor(public payload: string) { }
}

export class SetSelectedCityIdState {
  static readonly type = '[activity] set SelectedCityId';
  constructor(public payload?: string) { }
}

export class SetStatusIpState {
  static readonly type = '[status] set ip';
  constructor(public payload: string) { }
}

export class SetStatusTimeSlotBgPicture {
  static readonly type = '[status] set timeSlotBgPicture';
  constructor(public payload: boolean) { }
}

export class SetStatusThreeDayForecast {
  static readonly type = '[status] set threeDayForecast';
  constructor(public payload: boolean) { }
}

export class SetStatusSelectedCityIdState {
  static readonly type = '[status] set SelectedCityId';
  constructor(public payload?: string) { }
}

export class SetStatusConnected {
  static readonly type = '[status] set Connected';
  constructor(public payload: boolean) { }
}

export class SetStatusAway {
  static readonly type = '[status] set Away';
  constructor(public payload: boolean) { }
}

export class SetErrorsState {
  static readonly type = '[errors] set';
  constructor(public payload: AppErrorPayloadModel) { }
}

export class SetDataState {
  static readonly type = '[owm data] set';
  constructor(public payload: IOwmDataModel) { }
}

export class SetCitiesState {
  static readonly type = '[cities] set';
  constructor(public payload: ICities) { }
}

export class SetStatsState {
  static readonly type = '[stats] set';
  constructor(public payload: IOwmStats) { }
}

export class SetHistoryLogState {
  static readonly type = '[historyLog] set';
  constructor(public payload: IHistoryLog) { }
}

export class SetFallbackDataState {
  static readonly type = '[fallback data] set';
  constructor(public payload: IOwmDataModel) { }
}

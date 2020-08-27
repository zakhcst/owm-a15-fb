import { AppHistoryPayloadModel, AppErrorPayloadModel } from './app.models';
import { IOwmDataModel } from '../models/owm-data.model';

export class SetHistoryState {
  static readonly type = '[activity] set history';
  constructor(public payload: AppHistoryPayloadModel) {}
}

export class SetHistoryIpState {
  static readonly type = '[activity] set ip';
  constructor(public payload: string) {}
}

export class SetSelectedCityIdState {
  static readonly type = '[activity] set SelectedCityId';
  constructor(public payload?: string) {}
}

export class SetStatusIpState {
  static readonly type = '[status] set ip';
  constructor(public payload: string) {}
}

export class SetStatusTimeSlotBgPicture {
  static readonly type = '[status] set timeSlotBgPicture';
  constructor(public payload: boolean) {}
}

export class SetStatusThreeDayForecast {
  static readonly type = '[status] set threeDayForecast';
  constructor(public payload: boolean) {}
}

export class SetStatusSelectedCityIdState {
  static readonly type = '[status] set SelectedCityId';
  constructor(public payload?: string) {}
}

export class SetErrorsState {
  static readonly type = '[errors] set';
  constructor(public payload: AppErrorPayloadModel) {}
}

export class SetDataState {
  static readonly type = '[owm data] set';
  constructor(public payload: IOwmDataModel) {}
}


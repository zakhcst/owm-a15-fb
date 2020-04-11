import { IOwmData } from '../models/owm-data.model';

export interface HistoryRecordModel {
  cityId: string;
  time: number;
  owmData?: IOwmData;
}
export interface AppHistoryModel {
  ip?: string;
  selectedCityId?: string;
  sessionHistory: HistoryRecordModel[];
}

export interface AppHistoryPayloadModel {
  cityId?: string;
  cityName?: string;
  countryISO2?: string;
  owmData: IOwmData;
}

export interface ErrorRecordModel {
  logMessage: string;
  time: number;
}
export interface AppErrorsStateModel {
  ip?: string;
  sessionErrors: ErrorRecordModel[];
}

export interface AppErrorPayloadModel {
  userMessage: string;
  logMessage: string;
}

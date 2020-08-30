import { IOwmDataModel } from '../models/owm-data.model';

export interface HistoryRecordModel {
  cityId: string;
  time: number;
}

export interface IHistoryModel extends Array<IOwmDataModel> {}

export interface AppStatusModel {
  ip: string;
  normalizedIp: string;
  sessionStartTime: number; 
  selectedCityId: string;
  threeDayForecast: boolean;
  timeSlotBgPicture: boolean;
}

export interface AppHistoryPayloadModel {
  owmData: IOwmDataModel;
}

export interface ErrorRecordModel {
  logMessage: string;
  time: number;
  ip?: string;
}
export interface AppErrorsStateModel {
  sessionErrors: ErrorRecordModel[];
}

export interface AppErrorPayloadModel {
  userMessage: string;
  logMessage: string;
}

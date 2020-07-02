import { IOwmDataModel } from '../models/owm-data.model';

export interface HistoryRecordModel {
  cityId: string;
  time: number;
}

export interface IHistoryModel extends Array<IOwmDataModel> {}

export interface AppStatusModel {
  ip: string;
  sessionStartTime: number; 
  selectedCityId: string;
}

export interface AppHistoryPayloadModel {
  owmData: IOwmDataModel;
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

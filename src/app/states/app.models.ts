import { IStatusBuildInfo } from '../models/build-info.model';
import { IOwmDataModel } from '../models/owm-data.model';

export interface HistoryLogModel {
  cityId: string;
  time: number;
}

export interface IOwmDataCacheModel {
  [cityId: string]: IOwmDataModel;
}

export interface AppStatusModel {
  ip: string;
  normalizedIp: string;
  sessionStartTime: number;
  selectedCityId: string;
  connected: boolean;
  away: boolean;
  updatesAvailable: boolean;
  liveDataUpdate: boolean;
  daysForecast: number;
  showLoading: boolean;
  showDetailTimeSlotBgPicture: boolean;
  showDetailSecondary: boolean;
  showDetailPressure: boolean;
  showDetailHumidity: boolean;
  showDetailWind: boolean;
  showGChartHumidity: boolean;
  showGChartWind: boolean;
  showGChartIcons: boolean;
  buildInfo: IStatusBuildInfo;
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

export interface ErrorMessageLogModel {
  [time: number]: string;
}
export interface ErrorLogModel {
  [ip: string]: ErrorMessageLogModel;
}

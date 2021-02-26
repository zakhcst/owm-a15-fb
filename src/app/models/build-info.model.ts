export interface IBuilInfo {
  hash?: string;
  timeStamp?: number;
  version?: string;
}

export interface IStatusBuildInfo {
  previous?: IBuilInfo;
  current?: IBuilInfo;
  available?: IBuilInfo;
}


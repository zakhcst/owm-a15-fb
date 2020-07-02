export interface IOwmDataModel {
  city: IOwmCity;
  cnt: number;
  cod: string;
  list: IOwmDataModelTimeSlotUnit[];
  message: number;
  updated?: number;
  listByDate?: {
    [dateValue: string]: IOwmDataModelTimeSlotUnit;
  };
}

export interface IOwmDataModelObjectByCityId {
  [cityId: string]: IOwmDataModel;
}

export interface IOwmCity {
  coord: ICoords;
  country: string;
  id: number;
  name: string;
}

export interface ICoords {
  lat: number;
  lon: number;
}

export interface IOwmDataModelTimeSlotUnit {
  clouds?: {
    all: number;
  };
  dt: number;
  dt_txt?: string;
  main: {
    grnd_level?: number;
    humidity: number;
    pressure: number;
    sea_level?: number;
    temp: number;
    temp_kf?: number;
    temp_max?: number;
    temp_min?: number;
  };
  rain?: {
    '3h': number;
  };
  sys?: {
    pod: string;
  };
  weather: [
    {
      description: string;
      icon: string;
      id: number;
      main: string;
    }
  ];
  wind: {
    deg: number;
    speed: number;
  };
}

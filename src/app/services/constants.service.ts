import { Injectable } from '@angular/core';
import { ITimeTemplate } from '../models/hours.model';
import { IOwmData } from '../models/owm-data.model';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  constructor() {}

  public static readonly views = {
    stats: { path: 'stats', title: 'Stats', type: 'button' },
    forecastGChart: { path: 'forecast-gchart', title: 'GChart', type: 'button' },
    forecastFlex: { path: 'forecast-flex', title: 'Flex', type: 'button' },
    forecastGrid: { path: 'forecast-grid', title: 'Grid', type: 'button' },
    forecastAll: { path: '/forecast-all', title: 'All', type: 'button' },
    selectCities: { path: '', title: 'selectCities', type: 'selectCities' }
  };

  public static readonly toolbarActions = {
    stats: [
      ConstantsService.views.forecastFlex,
      ConstantsService.views.forecastGrid,
      ConstantsService.views.forecastGChart,
      ConstantsService.views.stats,
      ConstantsService.views.forecastAll
    ],
    'forecast-flex': [
      ConstantsService.views.selectCities,
      ConstantsService.views.forecastFlex,
      ConstantsService.views.forecastGrid,
      ConstantsService.views.forecastGChart,
      ConstantsService.views.stats,
      ConstantsService.views.forecastAll
    ],
    'forecast-grid': [
      ConstantsService.views.selectCities,
      ConstantsService.views.forecastFlex,
      ConstantsService.views.forecastGrid,
      ConstantsService.views.forecastGChart,
      ConstantsService.views.stats,
      ConstantsService.views.forecastAll
    ],
    'forecast-gchart': [
      ConstantsService.views.selectCities,
      ConstantsService.views.forecastFlex,
      ConstantsService.views.forecastGrid,
      ConstantsService.views.forecastGChart,
      ConstantsService.views.stats,
      ConstantsService.views.forecastAll
    ]
  };

  public static readonly owmData = 'owm';
  public static readonly historyLog = 'history-log';
  public static readonly errorsLog = 'errors-log';
  public static readonly default5DayForecastUrl =
    'https://api.openweathermap.org/data/2.5/forecast';
  public static readonly defaultUnits = 'metric';
  public static get defaultCityId() {
    return localStorage.getItem('lastCityId') || '2643743'; // Defaults to London, UK
  }

  public static readonly defaultAPPID = 'a354c550c575036102a4dce8d36e75d1';
  public static readonly owmFallbackData = 'assets/owm-fallback-data.json';
  public static readonly getIpUrl =
    'https://us-central1-owm-a7-fb.cloudfunctions.net/getip';
  public static readonly ipv4RE = new RegExp(
    '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
  );
  public static readonly owmIconsUrl = 'https://openweathermap.org/img/w/';
  public static readonly iconsOwm = 'assets/icons-list/';
  public static readonly iconWind = 'assets/icons8-windsock-16.png';
  public static readonly iconPressure =
    'assets/icons8-atmospheric-pressure-16.png';
  public static readonly iconHumidity = 'assets/icons8-hygrometer-16.png';
  public static readonly iconGithub = 'assets/icon32-github.svg';
  public static readonly iconExtLink = 'assets/icon24-external-link.svg';
  public static readonly arrow000Deg = String.fromCodePoint(8593);
  public static readonly snackbarDuration = 2500;
  public static readonly redirectDelay = 5;

  public static readonly weatherParams = {
    temperature: {
      title: 'Temperature',
      lineColor: '#ff0000',
      icon: 'assets/icons-list/'
    },
    wind: {
      title: 'Wind',
      lineColor: '#0000ff',
      icon: 'assets/icons8-windsock-16.png'
    },
    humidity: {
      title: 'Humidity',
      lineColor: '#eeee33',
      icon: 'assets/icons8-hygrometer-16.png'
    },
    pressure: {
      title: 'Pressure',
      lineColor: '#00ff00',
      icon: 'assets/icons8-atmospheric-pressure-16.png'
    }
  };

  public static readonly timeTemplate: ITimeTemplate[] = [
    { hour: 0, bgColor: '#305090', textColor: 'white' },
    { hour: 3, bgColor: '#4060bb', textColor: 'white' },
    { hour: 6, bgColor: '#6090ee', textColor: 'white' },
    // center 4 slots different text color for hi contrast
    // { hour: 9, bgColor: '#70b0ff', textColor: 'black' },
    // { hour: 12, bgColor: '#90c0ff', textColor: 'black' },
    // { hour: 15, bgColor: '#a0d0ff', textColor: 'black' },
    // { hour: 18, bgColor: '#70c0ff', textColor: 'black' },
    { hour: 9, bgColor: '#70b0ff', textColor: 'white' },
    { hour: 12, bgColor: '#90c0ff', textColor: 'white' },
    { hour: 15, bgColor: '#a0d0ff', textColor: 'white' },
    { hour: 18, bgColor: '#70c0ff', textColor: 'white' },
    { hour: 21, bgColor: '#5080dd', textColor: 'white' }
  ];

  public static readonly bgImgTypes: string[] = [
    'clear',
    'clouds',
    'fog',
    'rain',
    'snow'
  ];
  public static readonly weatherDefaultBgImgFileName = 'default.jpg';
  public static readonly weatherBgImgPath = 'assets/backgrounds/';
  public static readonly getWeatherDefaultBgImg = () =>
    ConstantsService.weatherBgImgPath +
    ConstantsService.weatherDefaultBgImgFileName
  public static readonly getWeatherBgImg = (data: IOwmData) => {
    const main =
      data && data.list && data.list[0] && data.list[0].weather[0].main;
    const syspod = data && data.list && data.list[0] && data.list[0].sys.pod;
    if (
      main &&
      main !== '' &&
      ConstantsService.bgImgTypes.includes(main.toLocaleLowerCase()) &&
      (syspod === 'd' || syspod === 'n')
    ) {
      return (
        ConstantsService.weatherBgImgPath +
        main.toLocaleLowerCase() +
        '_' +
        syspod +
        '.jpg'
      );
    } else {
      return ConstantsService.getWeatherDefaultBgImg();
    }
  }
}

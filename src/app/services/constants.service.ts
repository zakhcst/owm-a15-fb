import { Injectable } from '@angular/core';
import { ITimeTemplate } from '../models/hours.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConstantsService {
  constructor() { }

  public static readonly toolbarElements = {
    selectCities: { path: '', title: 'selectCities', type: 'selectCities' },
    forecastFlex: { path: 'forecast-detail', title: 'Detail', type: 'button' },
    forecastGChart: { path: 'forecast-gchart', title: 'Chart', type: 'button', disableOnDisconnected: true },
    stats: { path: 'stats', title: 'Stats', type: 'button' },
  };

  public static readonly toolbar = {
    'forecast-detail': {
      actions: [
        ConstantsService.toolbarElements.selectCities,
        ConstantsService.toolbarElements.forecastFlex,
        ConstantsService.toolbarElements.forecastGChart,
        ConstantsService.toolbarElements.stats,
      ],
      settingsOptions: {
        liveDataUpdate: true,
        daysForecast: true,
        slotsBackground: true,
        popupType: true,
        'detail-pressure': true,
        'detail-wind': true,
        'detail-humidity': true,
      },
      settingsDialog: {
        collapsibleHeight: 470,
      },
    },
    'forecast-gchart': {
      actions: [
        ConstantsService.toolbarElements.selectCities,
        ConstantsService.toolbarElements.forecastFlex,
        ConstantsService.toolbarElements.forecastGChart,
        ConstantsService.toolbarElements.stats,
      ],
      settingsOptions: {
        liveDataUpdate: true,
        daysForecast: true,
        popupType: true,
        'gchart-wind': true,
        'gchart-humidity': true,
        'gchart-icons': true,
      },
      settingsDialog: {
        collapsibleHeight: 380,
      },
    },
    stats: {
      actions: [
        ConstantsService.toolbarElements.forecastFlex,
        ConstantsService.toolbarElements.forecastGChart,
        ConstantsService.toolbarElements.stats,
      ],
      settingsOptions: {
        liveDataUpdate: true,
      },
      settingsDialog: {
        collapsibleHeight: 122,
      }
    },
  };

  public static readonly settingsDialogConfig = {
    width: 300,
    positionTop: 60,
    margin: 75,
  };

  public static readonly owmData = 'owm';
  public static readonly stats = 'stats';
  public static readonly historyLog = 'history-log';
  public static readonly errorsLog = 'errors-log';
  public static readonly reservedIps = ['0-0-0-0', '255-255-255-255', '--ip'];

  public static readonly default5DayForecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
  public static readonly defaultUnits = 'metric';
  public static readonly defaultAPPID = 'a354c550c575036102a4dce8d36e75d1';

  public static get defaultCityId() {
    return '2643743'; // Defaults to London, UK
  }

  public static readonly owmFallbackData = 'assets/owm-fallback-data.json';
  public static readonly getIpUrl = environment['functions'] + '/getip';
  public static readonly getIPv4Url = 'https://api.ipify.org';
  public static readonly getIPv64Url = 'https://api64.ipify.org';

  public static readonly ipv4RE = new RegExp(
    '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
  );
  public static readonly ipv6RE = new RegExp(
    '^([[:xdigit:]]{1,4}(?::[[:xdigit:]]{1,4}){7}|::|:(?::[[:xdigit:]]{1,4}){1,6}|[[:xdigit:]]{1,4}:(?::[[:xdigit:]]{1,4}){1,5}|(?:[[:xdigit:]]{1,4}:){2}(?::[[:xdigit:]]{1,4}){1,4}|(?:[[:xdigit:]]{1,4}:){3}(?::[[:xdigit:]]{1,4}){1,3}|(?:[[:xdigit:]]{1,4}:){4}(?::[[:xdigit:]]{1,4}){1,2}|(?:[[:xdigit:]]{1,4}:){5}:[[:xdigit:]]{1,4}|(?:[[:xdigit:]]{1,4}:){1,6}:)$'
  );

  public static readonly owmIconsUrl = 'https://openweathermap.org/img/w/';
  public static readonly iconsOwm = 'assets/icons-list/';
  public static readonly iconGithub = 'assets/icons-logo/icon32-github.svg';
  public static readonly iconExtLink = 'assets/icons-links/icon24-external-link.svg';
  public static readonly iconSettings = 'assets/icons-misc/settings-black-48dp.svg';

  public static readonly initCssIconsList = [
    'iconArrowWindDirection',
    'iconsMeasures',
    'iconsWeather'
  ];
  public static readonly iconsMeasures = 'assets/icons-measures/icons16x16-measures.png';
  public static readonly iconsWeather = 'assets/icons-weather/icons-weather.png';
  public static readonly iconArrowWindDirection = 'assets/icons-misc/wind-arrow.svg';

  public static readonly initCssShowPropertiesList = [
    'showDetailPressure',
    'showDetailWind',
    'showDetailHumidity',
    'showDetailSecondary'
  ];

  // public static readonly arrow000Deg = String.fromCodePoint(8593);
  public static readonly arrow000Deg = String.fromCodePoint(11165);
  public static readonly snackbarDuration = 1500;
  public static readonly redirectDelay = 5;
  public static readonly connectedResponseTimeout_ms = 1500;
  public static readonly dataResponseTimeout_ms = 2500;
  public static readonly loadingDataDebounceTime_ms = 1000;
  public static readonly popupDelay_ms = 2500;
  public static readonly gchartIconsShowDelay_ms = 2000;

  public static readonly iconsWeatherSize2 = 50;
  public static readonly iconsWeatherMap = {
    '01d': 0,
    '01n': 1,
    '02d': 2,
    '02n': 3,
    '03d': 4,
    '03n': 5,
    '04d': 6,
    '04n': 7,
    '09d': 8,
    '09n': 9,
    '10d': 10,
    '10n': 11,
    '11d': 12,
    '11n': 13,
    '13d': 14,
    '13n': 15,
    '50d': 16,
    '50n': 17,
  };

  public static readonly graphsKeys = ['temperature', 'wind', 'humidity', 'pressure'];
  public static readonly weatherParams = {
    temperature: {
      title: 'Temperature',
      lineColor: '#ff0000',
      icon: 'assets/icons-list/',
    },
    wind: {
      title: 'Wind',
      lineColor: '#0000ff',
      icon: 'assets/icons8-windsock-16.png',
    },
    humidity: {
      title: 'Humidity',
      lineColor: '#eeee33',
      icon: 'assets/icons8-hygrometer-16.png',
    },
    pressure: {
      title: 'Pressure',
      lineColor: '#00ff00',
      icon: 'assets/icons8-atmospheric-pressure-16.png',
    },
  };

  public static readonly timeTemplate: ITimeTemplate[] = [
    { hour: 0, bgColor: '#30509050', textColor: 'white' },
    { hour: 3, bgColor: '#4060bb50', textColor: 'white' },
    { hour: 6, bgColor: '#6090ee50', textColor: 'white' },
    { hour: 9, bgColor: '#70b0ff50', textColor: 'white' },
    { hour: 12, bgColor: '#90c0ff50', textColor: 'white' },
    { hour: 15, bgColor: '#a0d0ff50', textColor: 'white' },
    { hour: 18, bgColor: '#70c0ff50', textColor: 'white' },
    { hour: 21, bgColor: '#5080dd50', textColor: 'white' },
  ];

  public static readonly messageTypeColor = {
    popup__info: 'greenyellow',
    popup__warn: 'goldenrod',
    popup__error: 'red',
  };
  public static readonly bgImgTypes: string[] = 'clear clouds fog rain snow'.split(' ');
  public static readonly weatherDefaultBgImgFileName = 'default.jpg';
  public static readonly weatherBgImgPath = 'assets/backgrounds/';

}

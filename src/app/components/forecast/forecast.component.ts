import { Component, OnInit } from '@angular/core';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { IOwmStats } from '../../models/owm-stats.model';
import { ITimeTemplate } from '../../models/hours.model';
import { ICities } from '../../models/cities.model';
import { AppErrorPayloadModel } from '../../states/app.models';

import { ConstantsService } from '../../services/constants.service';
import { CitiesService } from '../../services/cities.service';
import { OwmStatsService } from '../../services/owm-stats.service';
import { GetBrowserIpService } from '../../services/get-browser-ip.service';
import { OwmDataService } from '../../services/owm-data.service';
import { ErrorsService } from '../../services/errors.service';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css']
})
export class ForecastComponent implements OnInit {
  selectedCityId: string = ConstantsService.defaultCityId;
  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  iconsUrl: string = ConstantsService.owmIconsUrl;
  iconsOwm: string = ConstantsService.iconsOwm;
  iconWind: string = ConstantsService.iconWind;
  iconHumidity: string = ConstantsService.iconHumidity;
  iconPressure: string = ConstantsService.iconPressure;
  arrow000Deg: string = ConstantsService.arrow000Deg;

  loadingOwmData = true;
  loadingCities = true;
  loadingStats = true;
  loadingError = false;

  cities: ICities;
  cities$: Observable<any>;
  stats: IOwmStats;
  statsSubscription: Subscription;
  ip: string;
  ipSubscription: Subscription;
  weatherData: any;
  weatherData$: Observable<any>;
  weatherDataSubscription: Subscription;

  constructor(
    private _cities: CitiesService,
    private _data: OwmDataService,
    private _ip: GetBrowserIpService,
    private _owmStats: OwmStatsService,
    private _history: HistoryService,
    private _errors: ErrorsService
  ) {}

  ngOnInit() {
    this._owmStats.getData().subscribe(
      stats => {
        this.stats = stats;
        this.loadingStats = false;
      },
      err => this.addError('ngOnInit: statsSubscription', err.message)
    );

    this.ipSubscription = this._ip.getIP().subscribe(
      ip => {
        this.ip = ip === 'ip-error' ? null : ip;
        // this.ipSubscription.unsubscribe();
      },
      err => this.addError('ngOnInit: ipSubscription', err.message)
    );
    this.onChange();
  }

  onChange() {
    this.loadingOwmData = true;
    this.cities$ = this._cities.getData().pipe(take(1));
    this.weatherData$ = this._data.getData(this.selectedCityId).pipe(take(1));
    const fjSubscription = forkJoin([this.cities$, this.weatherData$]).subscribe(
      responses => {
        const [cities, data] = responses;
        this.cities = cities;
        this.loadingCities = false;
        this.weatherData = data;
        this.loadingOwmData = false;
        const historyLog = {
          cityId: this.selectedCityId,
          cityName: cities[this.selectedCityId].name,
          countryISO2: cities[this.selectedCityId].iso2
        };
        this._history.add(historyLog);
        fjSubscription.unsubscribe();
      },
      err => {
        this.loadingOwmData = false;
        this.loadingError = true;
        this.addError('ngOnInit: onChange: subscribe', err.message);
        fjSubscription.unsubscribe();
      }
    );
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}

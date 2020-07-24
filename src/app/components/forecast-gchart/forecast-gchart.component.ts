import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
// import { GoogleChartComponent } from 'angular-google-charts';

import { Select } from '@ngxs/store';
import { AppErrorPayloadModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { OwmDataService } from '../../services/owm-data.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmDataModel, IListByDateModel } from '../../models/owm-data.model';
import { AppOwmDataState } from '../../states/app.state';
import { PopulateGchartDataService } from 'src/app/services/populate-gchart-data.service';
import { GoogleChartComponent } from 'angular-google-charts';

@Component({
  selector: 'app-forecast-gchart',
  templateUrl: './forecast-gchart.component.html',
  styleUrls: ['./forecast-gchart.component.css'],
})
export class ForecastGChartComponent implements OnInit, OnDestroy {
  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;

  loadingOwmData = true;
  loadingStats = true;

  weatherData: IOwmDataModel;
  weatherDataSubscription: Subscription;
  chart: {} = {};
  listByDateActive: IListByDateModel;
  activeDays: string[];
  weatherDataDateKeys: string[];
  showMaxGraphs: number;
  dynamicResize = true;

  @Select(AppOwmDataState.selectOwmData) owmData$: Observable<IOwmDataModel>;

  constructor(private _errors: ErrorsService, private _populateGchartData: PopulateGchartDataService) {}
  ngOnInit() {
    this.onChange();
  }

  ngOnDestroy() {
    if (this.weatherDataSubscription) {
      this.weatherDataSubscription.unsubscribe();
    }
  }

  onChange() {
    this.loadingOwmData = true;
    this.weatherDataSubscription = this.owmData$.pipe(filter(data => !!data)).subscribe(
      data => {
        this.weatherData = data;
        this.listByDateActive = this.weatherData.listByDate;
        this.activeDays = Object.keys(this.weatherData.listByDate).sort();
        this.weatherDataDateKeys = [...this.activeDays];
        this.loadingOwmData = false;
        this.chart = this._populateGchartData.setGChartData(this.weatherData.listByDate, this.weatherDataDateKeys);
      },
      err => {
        this.loadingOwmData = false;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
  }
  
  clickedDay(selectedDay) {
    this.activeDays = (this.activeDays.length === 1) ? [...this.weatherDataDateKeys] : [selectedDay];
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastGChartComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

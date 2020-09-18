import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { Observable, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Select, Store } from '@ngxs/store';
import { AppErrorPayloadModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmDataModel } from '../../models/owm-data.model';
import { AppOwmDataState, AppStatusState } from '../../states/app.state';
import { PopulateGchartDataService } from 'src/app/services/populate-gchart-data.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-forecast-gchart',
  templateUrl: './forecast-gchart.component.html',
  styleUrls: ['./forecast-gchart.component.css'],
})
export class ForecastGChartComponent implements OnInit, OnDestroy {
  @ViewChild('dateColumn', { static: true })
  dateColumn: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  loadingOwmData = true;
  weatherData: IOwmDataModel;
  chart: {} = {};
  activeDays: string[] = [];
  weatherDataDateKeys: string[];
  resizeObservable$: Observable<Event>;
  orientationchangeObservable$: Observable<Event>;
  layoutChangesOrientation$: Observable<BreakpointState>;
  subscriptions: Subscription;
  daysForecast = this._store.selectSnapshot(AppStatusState.daysForecast);

  @Select(AppOwmDataState.selectOwmData) owmData$: Observable<IOwmDataModel>;
  @Select(AppStatusState.daysForecast) daysForecast$: Observable<number>;

  constructor(
    private _errors: ErrorsService,
    private _populateGchartData: PopulateGchartDataService,
    private _breakpointObserver: BreakpointObserver,
    private _store: Store,
  ) {}

  ngOnInit() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.subscriptions = this.resizeObservable$.subscribe(() => {
      this.resizeGraphs(this.activeDays);
    });

    const layoutChangesOrientation$ = this._breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]);
    const layoutChangesOrientationSubscription = layoutChangesOrientation$.subscribe((result) => {
      if (this.activeDays.length > 0) this.resizeGraphs(this.activeDays);
    });
    this.subscriptions.add(layoutChangesOrientationSubscription);

    const daysForecastSubscription = this.daysForecast$.subscribe((daysForecast) => {
      this.daysForecast = daysForecast;
      if (this.activeDays.length > 0) {
        this.resizeGraphs(this.activeDays);
      }
    });
    this.subscriptions.add(daysForecastSubscription);

    this.onChange();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onChange() {
    this.loadingOwmData = true;
    const weatherDataSubscription = this.owmData$.pipe(filter((data) => !!data)).subscribe(
      (data) => {
        this.weatherData = data;
        this.activeDays = Object.keys(this.weatherData.listByDate).sort();
        this.weatherDataDateKeys = [...this.activeDays];
        this.loadingOwmData = false;
        this.chart = this._populateGchartData.setGChartData(this.weatherData.listByDate, this.weatherDataDateKeys);
        this.resizeGraphs(this.activeDays);
      },
      (err) => {
        this.loadingOwmData = false;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
    this.subscriptions.add(weatherDataSubscription);
  }

  clickedDay(selectedDay) {
    const activeDaysLength = this.activeDays.length;
    this.activeDays = [];
    const activeDays = activeDaysLength === 1 ? [...this.weatherDataDateKeys] : [selectedDay];
    this.resizeGraphs(activeDays);
    this.activeDays = activeDays;
  }

  resizeGraphs(activeDays: string[]) {
    const dateColumn = this.dateColumn.nativeElement;
    const documentBodyWidth = document.body.clientWidth;

    if (dateColumn) {
      const activeDaysLength = activeDays.length;
      const activeDaysHeightCoef = activeDaysLength === 1 ? 0.8 : 0.94;
      const graphHeight = Math.floor(
        (dateColumn.clientHeight * activeDaysHeightCoef) / this.daysForecast
      );
      const graphWidth = Math.floor(documentBodyWidth - 20 - 10 - 40);

      activeDays.forEach((dayK) => {
        this.chart[dayK].height = graphHeight;
        this.chart[dayK].width = graphWidth;
      });
    }
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastGChartComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

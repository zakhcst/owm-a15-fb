import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';

import { Observable, Subscription, fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { AppErrorPayloadModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmDataModel } from '../../models/owm-data.model';
import { AppOwmDataState } from '../../states/app.state';
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
  weatherDataSubscription: Subscription;
  chart: {} = {};
  activeDays: string[] = [];
  weatherDataDateKeys: string[];
  resizeObservable$: Observable<Event>;
  resizeSubscription: Subscription;
  orientationchangeObservable$: Observable<Event>;
  orientationchangeSubscription: Subscription;
  layoutChangesOrientation$: Observable<BreakpointState>;

  @Select(AppOwmDataState.selectOwmData) owmData$: Observable<IOwmDataModel>;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeGraphs(this.activeDays);
    }, 0);
  }

  constructor(
    private _errors: ErrorsService,
    private _populateGchartData: PopulateGchartDataService,
    private _breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription = this.resizeObservable$.subscribe((event) => {
      this.resizeGraphs(this.activeDays);
    });

    this.layoutChangesOrientation$ = this._breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]);

    this.layoutChangesOrientation$.subscribe((result) => {
      if (this.activeDays.length > 0) this.resizeGraphs(this.activeDays);
    });

    this.onChange();
  }

  ngOnDestroy() {
    if (this.weatherDataSubscription) {
      this.weatherDataSubscription.unsubscribe();
    }
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  onChange() {
    this.loadingOwmData = true;
    this.weatherDataSubscription = this.owmData$.pipe(filter((data) => !!data)).subscribe(
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
      const graphHeight = Math.floor((dateColumn.clientHeight * activeDaysHeightCoef) / activeDaysLength);
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

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { Observable, Subscription, fromEvent, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

import { Select, Store } from '@ngxs/store';
import { AppErrorPayloadModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';
import { IOwmDataModelTimeSlotUnit } from '../../models/owm-data.model';

import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmDataModel } from '../../models/owm-data.model';
import { AppStatusState } from '../../states/app.state';
import { PopulateGchartDataService } from 'src/app/services/populate-gchart-data.service';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ChartReadyEvent } from 'angular-google-charts';
import { DataCellExpandedComponent } from '../data-cell-expanded/data-cell-expanded.component';
import { MatDialog } from '@angular/material/dialog';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';

@Component({
  selector: 'app-forecast-gchart',
  templateUrl: './forecast-gchart.component.html',
  styleUrls: ['./forecast-gchart.component.css'],
})
export class ForecastGChartComponent implements OnInit, OnDestroy {
  @ViewChild('dateColumn', { static: true })
  dateColumn: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  weatherData: IOwmDataModel;
  chart: {} = {};
  activeDays: string[] = [];
  weatherDataDateKeys: string[];
  resizeObservable$: Observable<Event>;
  orientationchangeObservable$: Observable<Event>;
  layoutChangesOrientation$: Observable<BreakpointState>;
  subscriptions: Subscription;
  daysForecast = this._store.selectSnapshot(AppStatusState.daysForecast);
  containerPadding = 20;
  cardPadding = 10;
  dateColumnWidth = 40;
  overlaySubjecs = [];
  showGChartIcons = false;

  @Select(AppStatusState.daysForecast) daysForecast$: Observable<number>;
  @Select(AppStatusState.showGChartIcons) showGChartIcons$: Observable<boolean>;
  @Select(AppStatusState.showGChartHumidity) showGChartHumidity$: Observable<boolean>;
  @Select(AppStatusState.showGChartWind) showGChartWind$: Observable<boolean>;

  constructor(
    private _errors: ErrorsService,
    private _populateGchartData: PopulateGchartDataService,
    private _breakpointObserver: BreakpointObserver,
    private _store: Store,
    private _utils: OwmDataUtilsService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.subscribeResizeObservable();
    this.subscribeLayoutChangesOrientation();
    this.subscribeDaysForecast();
    this.subscribeOwmData();
    this.setDebounceIconsDraws();
    this.subscribeShowChartIcons();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  subscribeResizeObservable() {
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.subscriptions = this.resizeObservable$.subscribe(() => {
      if (this.activeDays.length > 0) {
        this.resizeGraphs(this.activeDays);
      }
    });
  }

  subscribeLayoutChangesOrientation() {
    const layoutChangesOrientation$ = this._breakpointObserver.observe([
      '(orientation: portrait)',
      '(orientation: landscape)',
    ]);
    const layoutChangesOrientationSubscription = layoutChangesOrientation$.subscribe((result) => {
      if (this.activeDays.length > 0) {
        this.resizeGraphs(this.activeDays);
      }
    });
    this.subscriptions.add(layoutChangesOrientationSubscription);
  }

  subscribeDaysForecast() {
    const daysForecastSubscription = this.daysForecast$.subscribe((daysForecast) => {
      this.daysForecast = daysForecast;
      if (this.activeDays.length > 0) {
        this.resizeGraphs(this.activeDays);
      }
    });
    this.subscriptions.add(daysForecastSubscription);
  }

  setDebounceIconsDraws() {
    // helper BehaviorSubjects array for each chart to debounce and delay icons redraws
    [...Array(6)].forEach(() => {
      const behaviorSubject = new BehaviorSubject(null);
      const overlaySubscription = behaviorSubject
        .pipe(
          filter((data) => !!data),
          debounceTime(1000)
        )
        .subscribe((data) => {
          this.redrawOverlay(data);
        });
      this.overlaySubjecs.push(behaviorSubject);
      this.subscriptions.add(overlaySubscription);
    });
  }

  subscribeShowChartIcons() {
    const showGChartIconsSubscription = this.showGChartIcons$.subscribe(showGChartIcons => {
      this.showGChartIcons = showGChartIcons;
    });
    this.subscriptions.add(showGChartIconsSubscription);
  }

  subscribeOwmData() {
    const weatherDataSubscription = combineLatest([
      this._utils.getOwmDataDebounced$({ showLoading: true }),
      this.showGChartWind$,
      this.showGChartHumidity$
    ]).subscribe(
      ([data, wind, humidity]) => {
        const showGraphs = { wind, humidity, temperature: true, pressure: true };
        this.weatherData = data;
        const dataDays = Object.keys(this.weatherData.listByDate).sort();
        if (this.activeDays.length === 1) {
          if (!dataDays.includes(this.activeDays[0])) {
            this.activeDays[0] = dataDays[0];
          }
        } else {
          this.activeDays = dataDays;
          this.weatherDataDateKeys = [...dataDays];
        }
        this.chart = this._populateGchartData.setGChartData(this.weatherData.listByDate, this.weatherDataDateKeys, showGraphs);
        this.resizeGraphs(this.activeDays);
      },
      (err) => {
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
    this.subscriptions.add(weatherDataSubscription);
  }

  clickedDay(selectedDay: string) {
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
      const activeDaysHeightCoef = activeDaysLength === 1 ? 1 : 0.94;
      const days = activeDaysLength === 1 ? 1 : this.daysForecast;
      const dateColumnClientHeight = dateColumn.clientHeight || window.innerHeight - 100;
      const graphHeight = Math.floor((dateColumnClientHeight * activeDaysHeightCoef) / days);
      const graphWidth = Math.floor(
        documentBodyWidth - this.containerPadding - this.cardPadding - this.dateColumnWidth
      );

      activeDays.forEach((dayK) => {
        this.chart[dayK].height = graphHeight;
        this.chart[dayK].width = graphWidth;
      });
    }
  }

  onReady($event: ChartReadyEvent, gc, overlay, overlayContent, ind) {
    if (!gc || !overlay || !overlayContent) { return; }
    overlayContent.setAttribute('style', 'display: none;');
    const extendedIndex = this.activeDays.length === 1 ? 5 : ind;
    const params = { gc, overlay, overlayContent, extendedIndex };
    this.overlaySubjecs[extendedIndex].next(params);
    // on debounce crashes use:
    // this.redrawOverlay({ gc, overlay, overlayContent, extendedIndex });
  }

  redrawOverlay({ gc, overlay, overlayContent, extendedIndex }) {
    const scaleFactor = 0.87;
    const cli = gc.chart.getChartLayoutInterface();
    const overlayTop = gc.height / 2 - 10;
    setTimeout(() => {
      overlay.setAttribute('style', `top: ${overlayTop}px;`);
      let chartArea;
      try {
        chartArea = cli.getChartAreaBoundingBox();
      } catch {
        console.log('Chart Refresh Error', extendedIndex, gc);
        chartArea = { left: gc.width * 0.65, width: gc.width * 0.75 };
      }
      const offsetLeft = chartArea.left + (chartArea.width * (1 - scaleFactor)) / 2;
      const overlayContentWidth = chartArea.width * scaleFactor;
      overlayContent.setAttribute(
        'style',
        `left: ${offsetLeft}px;
        width: ${overlayContentWidth}px;
        display: flex;
        `
      );
    }, 500);
  }

  showDataCellExpanded(timeSlotData: IOwmDataModelTimeSlotUnit, iconIndex: number) {
    if (timeSlotData && (iconIndex === 0 || iconIndex)) {
      const bgColor = this.timeTemplate[iconIndex].bgColor;
      this.dialog.open(DataCellExpandedComponent, {
        data: { timeSlotData, bgColor },
        panelClass: 'data-cell-expanded',
        hasBackdrop: true,
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

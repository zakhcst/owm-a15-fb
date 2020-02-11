import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { take, filter, map, distinctUntilKeyChanged } from 'rxjs/operators';
import { GoogleChartComponent } from 'angular-google-charts';

import { Select } from '@ngxs/store';
import { AppErrorPayloadModel, AppHistoryModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { OwmDataService } from '../../services/owm-data.service';
import { ErrorsService } from '../../services/errors.service';

@Component({
  selector: 'app-forecast-gchart',
  templateUrl: './forecast-gchart.component.html',
  styleUrls: ['./forecast-gchart.component.css']
})
export class ForecastGChartComponent implements OnInit, OnDestroy {
  @ViewChild('chartElement')
  chartElement: GoogleChartComponent;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;

  loadingOwmData = true;
  loadingStats = true;
  loadingError = false;

  weatherData: any;
  weatherData$: Observable<any>;
  weatherDataSubscription: Subscription;
  activitySubscription: Subscription;
  chart: {} = {};
  dateColumn: ViewContainerRef;
  weatherParams = ConstantsService.weatherParams;
  listByDateActive: any;

  @Select((state: any) => state.activity) activity$: Observable<
    AppHistoryModel
  >;

  constructor(private _data: OwmDataService, private _errors: ErrorsService) { }
  ngOnInit() {
    this.activitySubscription = this.activity$
      .pipe(
        map(
          activity =>
            activity.sessionHistory[activity.sessionHistory.length - 1]
        ),
        distinctUntilKeyChanged('cityId'),
        filter(activity => activity['cityId'] !== 'Init')
      )
      .subscribe(activity => {
        this.onChange(activity.cityId);
      });
  }

  ngOnDestroy() {
    if (this.weatherDataSubscription) {
      this.weatherDataSubscription.unsubscribe();
    }
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
    }
  }

  onChange(eventSelectedCityId: string) {
    this.loadingOwmData = true;
    if (this.weatherData$) {
      this.weatherDataSubscription.unsubscribe();
    }
    this.weatherData$ = this._data.getData(eventSelectedCityId).pipe(take(1));

    this.weatherDataSubscription = this.weatherData$.subscribe(
      data => {
        this.weatherData = data;
        this.listByDateActive = this.weatherData.listByDate;
        this.loadingOwmData = false;
        this.setCardBg2TimeSlotBg();
        this.setGChartData();
      },
      err => {
        this.loadingOwmData = false;
        this.loadingError = true;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
  }

  setGChartData() {
    Object.entries(this.weatherData.listByDate).forEach(([dayK, day], i1) => {
      this.chart[dayK] = {};
      this.chart[dayK].type = 'LineChart';
      this.chart[dayK].columnNames = [
        'Time',
        'Temperature',
        'Wind',
        'Humidity',
        'Pressure'
      ];
      this.chart[dayK].data = [];

      // add the missing slots at the begining
      const hoursKeys = Object.keys(day).sort((a, b) => (a > b ? +a : +b));
      let i = 0;
      while (ConstantsService.timeTemplate[i].hour < +hoursKeys[0]) {
        this.chart[dayK].data.push([
          ConstantsService.timeTemplate[i++].hour + ':00',
          undefined,
          undefined,
          undefined,
          undefined
        ]);
      }

      // copy values
      Object.entries(day).forEach(([hourK, hour], i2) => {
        this.chart[dayK].data.push([
          hourK + ':00',
          hour.main.temp,
          hour.wind.speed,
          hour.main.humidity,
          hour.main.pressure
        ]);
      });

      // add the missing slots at the end
      const timeTemplate = ConstantsService.timeTemplate;
      i = this.chart[dayK].data.length;
      // when slot[0] is available only - dublicate it
      if (i++ === 1) {
        this.chart[dayK].data.push(this.chart[dayK].data[0].slice(0));
        this.chart[dayK].data[1][0] = '3:00';
      }
      while (
        i < timeTemplate.length &&
        timeTemplate[i].hour > +hoursKeys[hoursKeys.length - 1]
      ) {
        this.chart[dayK].data.push([
          timeTemplate[i++].hour + ':00',
          undefined,
          undefined,
          undefined,
          undefined
        ]);
      }

      // add additional row to extend lines to the whole slot
      const last = [...this.chart[dayK].data[this.chart[dayK].data.length - 1]];
      last[0] = undefined;
      this.chart[dayK].data.push(last);

      this.chart[dayK].options = {
        curveType: 'function',
        animation: {
          duration: 1000,
          easing: 'out',
          startup: true
        },
        vAxes: {
          0: {
            textStyle: { color: this.dateColumnTextColor }
            // title: 'Celsius, m/s, %'
          },
          1: {
            textStyle: { color: this.dateColumnTextColor },
            // title: 'hPa'
            maxValue: 1050,
            minValue: 1000,
            format: '####'
          }
        },
        vAxis: {
          textStyle: { color: this.dateColumnTextColor },
          titleTextStyle: { color: this.dateColumnTextColor },
          format: '##',
          maxValue: 100,
          minorGridlines: { count: 0 }
        },
        hAxis: {
          textStyle: { color: this.dateColumnTextColor },
          viewWindowMode: 'maximized'
        },
        chartArea: { left: '5%', top: '5%', width: '85%', height: '75%' },
        left: 0,
        series: {
          0: {
            color: this.weatherParams.temperature.lineColor,
            targetAxisIndex: 0
          },
          1: {
            color: this.weatherParams.wind.lineColor
          },
          2: {
            color: this.weatherParams.humidity.lineColor
          },
          3: {
            color: this.weatherParams.pressure.lineColor,
            targetAxisIndex: 1
          }
        },
        legend: 'none',
        backgroundColor: 'transparent'
      };
    });
  }

  clickedDay(dataDaily: any) {
    if (Object.keys(this.listByDateActive).length === 1) {
      this.listByDateActive = this.weatherData.listByDate;
    } else {
      this.listByDateActive = {};
      this.listByDateActive[dataDaily.key] = dataDaily.value;
    }
  }

  setCardBg2TimeSlotBg() {
    const hour = new Date().getHours();
    const timeSlot = this.timeTemplate.find(
      timeSlotStart =>
        timeSlotStart.hour <= hour && hour < timeSlotStart.hour + 3
    );
    this.cardBackground = timeSlot.bgColor;
    this.dateColumnTextColor = timeSlot.textColor;
  }
  isCurrentTimeSlot(timeSlot) {
    const hour = new Date().getHours();
    return timeSlot.hour <= hour && hour < timeSlot.hour + 3;
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}

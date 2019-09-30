import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ElementRef,
  HostListener
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { take, filter, map, distinctUntilKeyChanged, tap } from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { AppErrorPayloadModel, AppHistoryModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { OwmDataService } from '../../services/owm-data.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmData } from '../../models/owm-data.model';

@Component({
  selector: 'app-forecast-grid',
  templateUrl: './forecast-grid.component.html',
  styleUrls: ['./forecast-grid.component.css']
})
export class ForecastGridComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fullHeightColumn', { static: false }) fullHeightColumn: ElementRef;
  @ViewChild('gridContainer', { static: false }) gridContainer: ElementRef;
  @Select((state: any) => state.activity) activity$: Observable<
    AppHistoryModel
  >;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  iconsUrl: string = ConstantsService.owmIconsUrl;
  iconsOwm: string = ConstantsService.iconsOwm;
  iconWind: string = ConstantsService.iconWind;
  iconHumidity: string = ConstantsService.iconHumidity;
  iconPressure: string = ConstantsService.iconPressure;
  arrow000Deg: string = ConstantsService.arrow000Deg;
  cardBackground: string;
  dateColumnTextColor: string;
  scrollbarHeight = 0;

  loadingOwmData = true;
  loadingStats = true;
  loadingError = false;

  weatherData: any;
  weatherData$: Observable<IOwmData>;
  weatherDataSubscription: Subscription;
  activitySubscription: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.hasScrollbar();
  }

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

  ngAfterViewInit() {
    this.hasScrollbar();
  }

  onChange(eventSelectedCityId: string) {
    this.loadingOwmData = true;
    this.weatherData$ = this._data.getData(eventSelectedCityId).pipe(take(1));

    this.weatherDataSubscription = this.weatherData$.subscribe(
      data => {
        this.weatherData = data;
        this.loadingOwmData = false;
        this.setCardBg2TimeSlotBg();
        this.hasScrollbar();
      },
      err => {
        this.loadingOwmData = false;
        this.loadingError = true;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
  }

  setCardBg2TimeSlotBg() {
    const timeSlot = this.timeTemplate.find(this.isCurrentTimeSlot);
    this.cardBackground = timeSlot.bgColor;
    this.dateColumnTextColor = timeSlot.textColor;
  }

  isCurrentTimeSlot(timeSlot: ITimeTemplate): boolean {
    const hour = new Date().getHours();
    return timeSlot.hour <= hour && hour < timeSlot.hour + 3;
  }

  hasScrollbar() {
    if (this.fullHeightColumn) {
      setTimeout(() => {
        this.scrollbarHeight =
          this.fullHeightColumn.nativeElement.clientHeight -
          this.gridContainer.nativeElement.clientHeight;
      }, 0);
    }
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastGridComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}

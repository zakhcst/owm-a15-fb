import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener
} from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import {
  take,
  filter,
  map,
  distinctUntilKeyChanged,
} from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { AppErrorPayloadModel, AppHistoryModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { OwmDataService } from '../../services/owm-data.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmData } from '../../models/owm-data.model';

@Component({
  selector: 'app-forecast-flex',
  templateUrl: './forecast-flex.component.html',
  styleUrls: ['./forecast-flex.component.css'],
  animations: [
    trigger('showTimeSlot', [
      transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            stagger('0.1s', [animate('0.3s', style({ opacity: 1 }))])
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class ForecastFlexComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fullHeightColumn', { static: true }) fullHeightColumn: ElementRef;
  @ViewChild('gridContainer', { static: true }) gridContainer: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;

  loadingOwmData = true;
  loadingStats = true;

  weatherData: IOwmData;
  listByDateLength = 0;
  weatherData$: Observable<IOwmData>;
  weatherDataSubscription: Subscription;
  activitySubscription: Subscription;
  scrollbarHeight = 0;

  @Select((state: any) => state.activity) activity$: Observable<
    AppHistoryModel
  >;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.hasScrollbar();
  }

  constructor(private _data: OwmDataService, private _errors: ErrorsService) {}

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
    this.weatherData$ = this._data.getData(eventSelectedCityId).pipe(
      take(1),
    );

    this.weatherDataSubscription = this.weatherData$.subscribe(
      data => {
        this.weatherData = data;
        this.listByDateLength = Object.keys(data.listByDate).length;

        this.loadingOwmData = false;
        this.setCardBg2TimeSlotBg();
        this.hasScrollbar();
      },
      err => {
        this.loadingOwmData = false;
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
      logMessage: `ForecastFlexComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}

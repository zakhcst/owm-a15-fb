import { Component, OnInit, OnDestroy, ViewChild, ElementRef, /* AfterViewInit,*/HostListener } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';

import { Select } from '@ngxs/store';
import { AppErrorPayloadModel } from '../../states/app.models';
import { ITimeTemplate } from '../../models/hours.model';

import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { IOwmData } from '../../models/owm-data.model';
import { AppDataState } from 'src/app/states/app.state';

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
export class ForecastFlexComponent implements OnInit, OnDestroy {
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
  scrollbarHeight = 0;

  @Select(AppDataState.last) data$: Observable<IOwmData>;
  
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.hasScrollbar();
  }

  constructor(private _errors: ErrorsService) {}

  ngOnInit() {
    this.onInit();
  }

  ngOnDestroy() {
    if (this.weatherDataSubscription) {
      this.weatherDataSubscription.unsubscribe();
    }
  }

  // ngAfterViewInit() {
  //   setTimeout(() => this.hasScrollbar(), 0);
  // }

  onInit() {
    this.loadingOwmData = true;
    this.weatherDataSubscription = this.data$.subscribe(
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

  trackByIdFn(index: any, item: any) {
    return index;
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastFlexComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}

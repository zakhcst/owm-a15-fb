import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';

import { ConstantsService } from '../../services/constants.service';
import { ITimeTemplate } from '../../models/hours.model';
import { ErrorsService } from '../../services/errors.service';

import { Select } from '@ngxs/store';
import { IOwmDataModel, IListByDateModel } from '../../models/owm-data.model';
import { AppStatusState } from 'src/app/states/app.state';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DataCellExpandedComponent } from '../data-cell-expanded/data-cell-expanded.component';
import { MatDialog } from '@angular/material/dialog';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';

@Component({
  selector: 'app-forecast-flex',
  templateUrl: './forecast-flex.component.html',
  styleUrls: ['./forecast-flex.component.css'],
  animations: [
    trigger('showTimeSlot', [
      transition(':enter', [
        query(':enter', [style({ opacity: 0 }), stagger('0.1s', [animate('0.3s', style({ opacity: 1 }))])], {
          optional: true,
        }),
      ]),
    ]),
  ],
})
export class ForecastFlexComponent implements OnInit, OnDestroy {
  @ViewChild('gridContainer', { static: false }) gridContainer: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;
  weatherData: IOwmDataModel;
  listByDateLength = 0;
  scrollbarHeight = 0;
  listByDate: IListByDateModel;
  subscriptions: Subscription;
  daysForecast = 5;
  frames = 10;
  scrolling = false;

  @Select(AppStatusState.daysForecast) daysForecast$: Observable<number>;

  constructor(
    private _errors: ErrorsService,
    public dialog: MatDialog,
    private _utils: OwmDataUtilsService
  ) {}
  
  ngOnInit() {
    this.subscribeOwmData();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  subscribeOwmData() {
    this.subscriptions = this._utils.getOwmDataDebounced$({ showLoading: true }).subscribe(
      (data) => {
        this.weatherData = data;
        this.listByDate = data.listByDate;
        this.listByDateLength = Object.keys(data.listByDate).length;
      },
      (err) => {
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );

    const daysForecastSubscription = this.daysForecast$.subscribe((daysForecast) => {
      this.daysForecast = daysForecast;
    });

    this.subscriptions.add(daysForecastSubscription);
  }

  onMouseWheel(event: any) {
    if (this.scrolling) return;
    if (this.gridContainer && !event.shiftKey) {
      const step = event.deltaY * 2 / this.frames;
      let frameCount = 1;
      this.scrolling = true;
      const interval = setInterval(() => {
        this.gridContainer.nativeElement.scrollLeft += step;
        if (this.frames < frameCount++) {
          clearInterval(interval);
          this.scrolling = false;
        }
      }, 20);
    }
  }

  showDataCellExpanded(timeSlotData, bgColor: string) {
    if (timeSlotData) {
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
      logMessage: `ForecastFlexComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

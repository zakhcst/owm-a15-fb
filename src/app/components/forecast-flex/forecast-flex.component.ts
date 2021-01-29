import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, of, Subscription, timer } from 'rxjs';
import { debounce, filter, tap } from 'rxjs/operators';

import { ConstantsService } from '../../services/constants.service';
import { ITimeTemplate } from '../../models/hours.model';
import { ErrorsService } from '../../services/errors.service';

import { Select, Store } from '@ngxs/store';
import { IOwmDataModel, IListByDateModel } from '../../models/owm-data.model';
import { AppOwmDataState, AppStatusState } from 'src/app/states/app.state';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DataCellExpandedComponent } from '../data-cell-expanded/data-cell-expanded.component';
import { MatDialog } from '@angular/material/dialog';
import { OwmDataManagerService } from 'src/app/services/owm-data-manager.service';

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

  loadingOwmData = true;

  weatherData: IOwmDataModel;
  listByDateLength = 0;
  scrollbarHeight = 0;
  listByDate: IListByDateModel;
  daysForecast = this._store.selectSnapshot(AppStatusState.daysForecast);
  subscriptions: Subscription;

  @Select(AppStatusState.daysForecast) daysForecast$: Observable<number>;

  constructor(
    private _errors: ErrorsService,
    public dialog: MatDialog,
    private _store: Store,
    private _data: OwmDataManagerService
  ) {}

  ngOnInit() {
    this.onInit();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onInit() {
    this.loadingOwmData = true;
    this.subscribeOwmData();
  }

  subscribeOwmData() {
    this.subscriptions = this._data.getOwmData$({ showLoading: true }).subscribe(
      (data) => {
        this.weatherData = data;
        this.listByDate = data.listByDate;
        this.listByDateLength = Object.keys(this.weatherData.listByDate).length;
        this.loadingOwmData = false;
      },
      (err) => {
        this.loadingOwmData = false;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );

    const daysForecastSubscription = this.daysForecast$.subscribe((daysForecast) => {
      this.daysForecast = daysForecast;
    });

    this.subscriptions.add(daysForecastSubscription);
  }

  onMouseWheel(event: any) {
    if (this.gridContainer && !event.shiftKey) {
      const frames = 20;
      const step = event.deltaY / frames;
      let count = 0;
      const interval = setInterval(() => {
        this.gridContainer.nativeElement.scrollLeft += step;
        if (++count >= frames) {
          clearInterval(interval);
        }
      }, 10);
    }
  }

  trackByIdFn(index: any, item: any) {
    return index;
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

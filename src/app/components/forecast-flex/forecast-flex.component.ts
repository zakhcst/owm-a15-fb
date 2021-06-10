import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';

import { ConstantsService } from '../../services/constants.service';
import { ITimeTemplate } from '../../models/hours.model';
import { ErrorsService } from '../../services/errors.service';

import { Select } from '@ngxs/store';
import { IOwmDataModel, IListByDateModel } from '../../models/owm-data.model';
import { AppStatusState } from 'src/app/states/app.state';
import { AppErrorModel } from '../../states/app.models';
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
export class ForecastFlexComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gridContainer', { static: false }) gridContainer: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;
  weatherData: IOwmDataModel;
  scrollbarHeight = 0;
  listByDate: IListByDateModel;
  subscriptions: Subscription;
  frames = 10;
  onMouseWheelIntervalDelay_ms = 20;
  animateScrollRedrawDelay_ms = 1100;
  animateScrollIntervalDelay_ms = 100;
  scrolling = false;

  @Select(AppStatusState.daysForecast) daysForecast$: Observable<number>;

  constructor(private _errors: ErrorsService, public dialog: MatDialog, private _utils: OwmDataUtilsService) { }

  ngOnInit() {
    this.subscribeOwmData();
  }

  ngAfterViewInit() {
    this.scrollTodaySlotsInViewport();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  scrollTodaySlotsInViewport() {
    const maxSlotsPerDay = this.timeTemplate.length;
    const gridContainer = this.gridContainer?.nativeElement;
    if (!gridContainer || gridContainer.scrollWidth === gridContainer.clientWidth) { return; }

    const scrollSlotWidth = Math.round(gridContainer.scrollWidth / maxSlotsPerDay);
    const viewportSlots = Math.round(gridContainer.clientWidth / scrollSlotWidth);

    const listByDateKeysSorted = Object.keys(this.listByDate).sort((d1, d2) => +d1 - +d2);
    const todayKey = listByDateKeysSorted[0];
    const todaySlots = this.listByDate[todayKey];
    const todaySlotsCount = Object.keys(todaySlots).length;

    if (viewportSlots + todaySlotsCount > maxSlotsPerDay) { return; }

    const scrollPositions = maxSlotsPerDay - todaySlotsCount;
    this.animateScroll(gridContainer, scrollPositions, scrollSlotWidth);
  }

  animateScroll(gridContainer, scrollPositions, scrollSlotWidth) {
    setTimeout(() => {
      const interval = setInterval(() => {
        gridContainer.scrollLeft += scrollSlotWidth;
        scrollPositions--;
        if (scrollPositions < 1) {
          clearInterval(interval);
        }
      }, this.animateScrollIntervalDelay_ms);
    }, this.animateScrollRedrawDelay_ms);
  }

  subscribeOwmData() {
    this.subscriptions = this._utils.getOwmDataDebounced$({ showLoading: true }).subscribe(
      (data) => {
        this.weatherData = data;
        this.listByDate = data.listByDate;
      },
      (err) => {
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
  }

  onMouseWheel(event: any) {
    if (this.scrolling) { return; }
    if (this.gridContainer && !event.shiftKey) {
      const step = (event.deltaY * 2) / this.frames;
      let frameCount = 1;
      this.scrolling = true;
      const interval = setInterval(() => {
        this.gridContainer.nativeElement.scrollLeft += step;
        if (this.frames < frameCount++) {
          clearInterval(interval);
          this.scrolling = false;
        }
      }, this.onMouseWheelIntervalDelay_ms);
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
    const errorLog: AppErrorModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastFlexComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

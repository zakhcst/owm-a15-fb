import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { ConstantsService } from '../../services/constants.service';
import { ITimeTemplate } from '../../models/hours.model';
import { ErrorsService } from '../../services/errors.service';

import { Select } from '@ngxs/store';
import { IOwmDataModel } from '../../models/owm-data.model';
import { AppOwmDataState } from 'src/app/states/app.state';
import { AppErrorPayloadModel } from '../../states/app.models';

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
  @ViewChild('fullHeightColumn', { static: true }) fullHeightColumn: ElementRef;
  @ViewChild('gridContainer', { static: true }) gridContainer: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;

  loadingOwmData = true;

  weatherData: IOwmDataModel;
  listByDateLength = 0;
  weatherDataSubscription: Subscription;
  scrollbarHeight = 0;

  @Select(AppOwmDataState.selectOwmData) owmData$: Observable<IOwmDataModel>;

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

  onInit() {
    this.loadingOwmData = true;
    this.weatherDataSubscription = this.owmData$.pipe(filter(data => !!data)).subscribe(
      data => {
        this.weatherData = data;
        this.listByDateLength = Object.keys(this.weatherData.listByDate).length;

        this.loadingOwmData = false;
        this.hasScrollbar();
      },
      err => {
        this.loadingOwmData = false;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
  }

  onMouseWheel(event: any) {
    if (this.gridContainer && !this.gridContainer.nativeElement.shiftKey)
      this.gridContainer.nativeElement.scrollLeft += event.deltaY;
  }

  hasScrollbar() {
    if (this.fullHeightColumn) {
      setTimeout(() => {
        this.scrollbarHeight =
          this.fullHeightColumn.nativeElement.clientHeight - this.gridContainer.nativeElement.clientHeight;
      }, 0);
    }
  }

  trackByIdFn(index: any, item: any) {
    return index;
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastFlexComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
  @ViewChild('gridContainer', { static: false }) gridContainer: ElementRef;

  timeTemplate: ITimeTemplate[] = ConstantsService.timeTemplate;
  cardBackground: string;
  dateColumnTextColor: string;

  loadingOwmData = true;

  weatherData: IOwmDataModel;
  listByDateLength = 0;
  weatherDataSubscription: Subscription;
  scrollbarHeight = 0;

  @Select(AppOwmDataState.selectOwmData) owmData$: Observable<IOwmDataModel>;

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
        this.listByDateLength = Object.keys(data.listByDate).length;
        this.weatherData = data;

        this.loadingOwmData = false;
      },
      err => {
        this.loadingOwmData = false;
        this.addError('ngOnInit: onChange: subscribe', err.message);
      }
    );
  }

  onMouseWheel(event: any) {
    if (this.gridContainer && !event.shiftKey)
      this.gridContainer.nativeElement.scrollLeft += event.deltaY;
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

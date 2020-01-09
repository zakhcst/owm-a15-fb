import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostBinding
} from '@angular/core';
import { ICities } from '../../models/cities.model';
import {
  ActivatedRoute,
  Router,
  ChildActivationEnd,
  NavigationEnd,
  Event
} from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';
import { filter, map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { HistoryService } from '../../services/history.service';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DomSanitizer } from '@angular/platform-browser';
import { MatToolbar } from '@angular/material/toolbar';
import { Select } from '@ngxs/store';
import { IOwmData } from 'src/app/models/owm-data.model';

@Component({
  selector: 'app-header-toolbar',
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.css']
})
export class HeaderToolbarComponent
  implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatToolbar, { static: false }) matToolbar: MatToolbar;
  @ViewChild('containertoolbaroutlet', { static: true })
  containerToolbarOutlet: ElementRef;

  @HostBinding('attr.style')
  public get valueAsStyle(): any {
    if (this.matToolbar) {
      this.toolbarHeight = this.matToolbar._elementRef.nativeElement.clientHeight;
    }
    return this._sanitizer.bypassSecurityTrustStyle(
      `--toolbar-height: ${this.toolbarHeight}px`
    );
  }

  toolbarActions: [] = [];
  toolbarShow = true;
  cities: ICities;
  selectedCityId: string = ConstantsService.defaultCityId;
  subscriptions: Subscription;
  showActionButtonsXS = false;
  xs = false;
  toolbarHeight: number;
  weatherBackgroundImg: string;

  @Select((state: any) => state.data) data$: Observable<IOwmData>;

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _history: HistoryService,
    private _errors: ErrorsService,
    private _sanitizer: DomSanitizer,
    public mediaObserver: MediaObserver
  ) {
    this.subscriptions = this._router.events
      .pipe(
        filter((event: Event) => event instanceof NavigationEnd),
        map(
          (event: ChildActivationEnd) =>
            event['urlAfterRedirects'].split('/').pop() ||
            event['url'].split('/').pop()
        )
      )
      .subscribe(
        eventPathEndSegment => {
          if (eventPathEndSegment in ConstantsService.toolbarActions) {
            if (
              this.toolbarActions !==
              ConstantsService.toolbarActions[eventPathEndSegment]
            ) {
              this.toolbarActions =
                ConstantsService.toolbarActions[eventPathEndSegment];
              this.toolbarShow = true;
            }
          } else {
            this.toolbarShow = false;
          }
        },
        err => {
          this.addError('header-toolbar: router.events', err.message);
        }
      );
    const subscriptionCities: Subscription = this._activatedRoute.data.subscribe(
      data => {
        this.cities = data.cities;
        this.selectionChange(null);
      },
      err => {
        this.addError('header-toolbar: subscriptionCities', err.message);
      }
    );

    this.subscriptions.add(subscriptionCities);
  }

  ngOnInit() {
    const subscriptionBgImg: Subscription = this.data$
      .pipe(
        map((data: IOwmData) => ConstantsService.getWeatherBgImg(data)),
        filter((newDataImgPath: string) => {
          const currentBgImgPath = this.containerToolbarOutlet.nativeElement.style['background-image'].split('"')[1];
          return currentBgImgPath !== newDataImgPath;
        })
      )
      .subscribe(
        (imgPath: string) => {
          this.containerToolbarOutlet.nativeElement.style[
            'background-image'
          ] = `url(${imgPath})`;
        },
        err => {
          this.addError(
            'header-toolbar: ngOnInit: onChange: subscribe',
            err.message
          );
        }
      );

    this.subscriptions.add(subscriptionBgImg);
  }

  ngAfterViewInit() {
    this.toolbarHeight = this.matToolbar._elementRef.nativeElement.clientHeight;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  isXs() {
    return this.mediaObserver.isActive('xs');
  }

  toggleActionButtonsXS($event: any) {
    this.showActionButtonsXS =
      this.isXs() && this.showActionButtonsXS ? false : true;
  }

  hideActionButtonsXS($event) {
    this.showActionButtonsXS = false;
  }

  selectionChange(eventSelectedCityId) {
    this.selectedCityId =
      eventSelectedCityId ||
      this.selectedCityId ||
      ConstantsService.defaultCityId;
    const historyLog = {
      cityId: this.selectedCityId,
      cityName: this.cities[this.selectedCityId].name,
      countryISO2: this.cities[this.selectedCityId].iso2
    };
    this._history.add(historyLog);
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastComponent: ${custom}: ${errorMessage}`
    };
    this._errors.add(errorLog);
  }
}

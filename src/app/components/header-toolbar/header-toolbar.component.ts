import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostBinding,
  HostListener,
} from '@angular/core';
import { ICities } from '../../models/cities.model';
import { Router, ChildActivationEnd, NavigationEnd, Event } from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';
import { catchError, debounce, filter, map, switchMap, tap } from 'rxjs/operators';
import { Subscription, Observable, timer, of, throwError } from 'rxjs';
import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DomSanitizer } from '@angular/platform-browser';
import { MatToolbar } from '@angular/material/toolbar';
import { Select, Store } from '@ngxs/store';
import { IOwmDataModel } from '../../models/owm-data.model';
import { AppCitiesState, AppStatusState } from '../../states/app.state';
import { SetStatusSelectedCityId } from '../../states/app.actions';
import { MatDialog } from '@angular/material/dialog';
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';

@Component({
  selector: 'app-header-toolbar',
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.css'],
})
export class HeaderToolbarComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatToolbar) matToolbar: MatToolbar;
  @ViewChild('container', { static: true }) container: ElementRef;

  @HostBinding('attr.style')
  public get valueAsStyle(): any {
    if (this.matToolbar) {
      this.toolbarHeight = this.matToolbar._elementRef.nativeElement.clientHeight + 1;
    }
    return this._sanitizer.bypassSecurityTrustStyle(`--toolbar-height: ${this.toolbarHeight}px`);
  }

  toolbarActions: [] = [];
  settingsOptions: {} = {};
  toolbarShow = true;
  loaded = false;
  selectedCityId: string = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId) || ConstantsService.defaultCityId;
  iconSettings = ConstantsService.iconSettings;
  subscriptions: Subscription;
  showActionButtonsXS = false;
  xs500w = false;
  toolbarHeight: number;
  weatherBackgroundImg: string;
  owmData: IOwmDataModel;
  owmDataExpired = false;
  connected = true;
  updatesAvailable = false;
  currentPageKey: (string | null) = null;

  @Select(AppCitiesState.selectCities) cities$: Observable<ICities>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  @Select(AppStatusState.updatesAvailable) updatesAvailable$: Observable<boolean>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isXs();
  }

  constructor(
    private _router: Router,
    private _utils: OwmDataUtilsService, // Instantiate service to start listeners
    private _store: Store,
    private _errors: ErrorsService,
    private _sanitizer: DomSanitizer,
    public mediaObserver: MediaObserver,
    public dialog: MatDialog,
  ) {
    this.subscribeRouterEvents();
    this.subscribeAvailableUpdates();
  }

  subscribeAvailableUpdates() {
    const subscriptionAvailableUpdates = this.updatesAvailable$.subscribe(updatesAvailable => {
      this.updatesAvailable = updatesAvailable;
    });
    this.subscriptions = subscriptionAvailableUpdates;
  }

  subscribeRouterEvents() {

    this.subscriptions = this._router.events
      .pipe(
        filter((event: Event) => event instanceof NavigationEnd),
        map((event: ChildActivationEnd) => event['urlAfterRedirects'].split('/').pop() || event['url'].split('/').pop()),
        filter(eventPathEndSegment => eventPathEndSegment && (eventPathEndSegment in ConstantsService.toolbar)),
        tap(eventPathEndSegment => this.currentPageKey = eventPathEndSegment),
        // filter(eventPathEndSegment => (this.toolbarActions !== ConstantsService.toolbar[eventPathEndSegment])),
      )
      .subscribe(
        (eventPathEndSegment) => {
          // if (eventPathEndSegment in ConstantsService.toolbar) {
          if (this.toolbarActions !== ConstantsService.toolbar[eventPathEndSegment]) {
            this.toolbarActions = ConstantsService.toolbar[eventPathEndSegment].actions;
            // this.settingsOptions = ConstantsService.toolbar[eventPathEndSegment].settingsOptions;
            this.toolbarShow = true;
          } else {
            this.toolbarShow = false;
          }
        },
        (err) => {
          this.addError('header-toolbar: router.events', err.message);
        }
      );
  }

  ngOnInit() {
    this.isXs();
    this.subscribeOwmData();
    this.subscribeConnected();
  }

  subscribeConnected() {
    const subscriptionConnected = this.connected$.pipe(
      debounce(connected => connected ? of(true) : timer(ConstantsService.connectedResponseTimeout_ms)),
    ).subscribe(connected => {
      this.connected = connected;
    });
    this.subscriptions.add(subscriptionConnected);
  }

  subscribeOwmData() {
    const subscriptionOwmData = this._utils.getOwmDataDebounced$({ showLoading: false })
      .pipe(
        tap((data: IOwmDataModel) => {
          this.owmData = data;
          this.owmDataExpired = !this._utils.isNotExpired(data);
        }),
        map((data: IOwmDataModel) => this._utils.getWeatherBgImg(data.list[0])),
        filter((newDataImgPath: string) => {
          const currentBgImgPath = this.container.nativeElement.style['background-image'].split('"')[1];
          return currentBgImgPath !== newDataImgPath;
        })
      )
      .subscribe(
        (imgPath: string) => {
          this.container.nativeElement.style['background-image'] = `url(${imgPath})`;
          this.loaded = true;
        },
        (err) => {
          this.addError('header-toolbar: ngOnInit: onChange: subscribe', err.message);
          this.loaded = true;
        }
      );

    this.subscriptions.add(subscriptionOwmData);
  }

  ngAfterViewInit() {
    this.toolbarHeight = this.matToolbar._elementRef.nativeElement.clientHeight;
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  isXs() {
    this.xs500w = this.mediaObserver.isActive('xs500w');
    return this.xs500w;
  }

  toggleActionButtonsXS($event) {
    this.showActionButtonsXS = this.xs500w && this.showActionButtonsXS ? false : true;
  }

  hideActionButtonsXS($event) {
    this.showActionButtonsXS = false;
  }

  showSettings(settingsButton) {
    const { width, positionTop, margin } = ConstantsService.settingsDialogConfig;
    const { collapsibleHeight } = ConstantsService.toolbar[this.currentPageKey].settingsDialog;
    const settingsButtonLeft = settingsButton._elementRef.nativeElement.offsetLeft;
    const settingsButtonoffsetWidth = settingsButton._elementRef.nativeElement.offsetWidth;
    const dialogPositionLeft = settingsButtonLeft + (this.isXs() ? settingsButtonoffsetWidth + 10 : - (width + 10));
    const config = {
      panelClass: 'dialog-settings',
      position: {
        top: positionTop + 'px',
        left: dialogPositionLeft + 'px',
      },
      width: width + 'px',
      data: {
        settingsButton, positionTop, width, margin, collapsibleHeight,
        mediaObserver: this.mediaObserver,
        currentPageKey: this.currentPageKey

      },
      hasBackdrop: true,
    };

    const windowHeight = window.innerHeight;
    const dialogHeight = (windowHeight < collapsibleHeight) ? (windowHeight - margin + 'px') : 'auto';
    config['height'] = dialogHeight;

    return this.dialog.open(DialogSettingsComponent, config);
  }

  selectedCityChange() {
    this._store.dispatch(new SetStatusSelectedCityId(this.selectedCityId));
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

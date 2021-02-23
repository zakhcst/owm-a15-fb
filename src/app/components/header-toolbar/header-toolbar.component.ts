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
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DomSanitizer } from '@angular/platform-browser';
import { MatToolbar } from '@angular/material/toolbar';
import { Select, Store } from '@ngxs/store';
import { IOwmDataModel } from '../../models/owm-data.model';
import { OwmDataManagerService } from '../../services/owm-data-manager.service';
import { AppCitiesState, AppStatusState } from '../../states/app.state';
import { SetStatusSelectedCityId } from '../../states/app.actions';
import { MatDialog } from '@angular/material/dialog';
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';

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

  @Select(AppCitiesState.selectCities) cities$: Observable<ICities>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  @Select(AppStatusState.updatesAvailable) updatesAvailable$: Observable<boolean>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isXs();
  }

  constructor(
    private _router: Router,
    private _data: OwmDataManagerService, // Instantiate service to start listeners
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
    const subscriptionAvailableUpdates =  this.updatesAvailable$.subscribe(updatesAvailable => {
      this.updatesAvailable = updatesAvailable;
    });
    this.subscriptions.add(subscriptionAvailableUpdates);
  }

  subscribeRouterEvents() {
    this.subscriptions = this._router.events
    .pipe(
      filter((event: Event) => event instanceof NavigationEnd),
      map((event: ChildActivationEnd) => event['urlAfterRedirects'].split('/').pop() || event['url'].split('/').pop())
    )
    .subscribe(
      (eventPathEndSegment) => {
        if (eventPathEndSegment in ConstantsService.toolbar) {
          if (this.toolbarActions !== ConstantsService.toolbar[eventPathEndSegment]) {
            this.toolbarActions = ConstantsService.toolbar[eventPathEndSegment].actions;
            this.settingsOptions = ConstantsService.toolbar[eventPathEndSegment].settingsOptions;
            this.toolbarShow = true;
          }
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
  
  subscribeConnected(){
    const subscriptionConnected = this.connected$.pipe(debounceTime(ConstantsService.connectedResponseTimeLimit_ms)).subscribe(connected => {
      this.connected = connected;
    })
    this.subscriptions.add(subscriptionConnected);
  }

  subscribeOwmData() {
    const subscriptionOwmData = this._data.getOwmData$( { showLoading: false })
      .pipe(
        tap((data: IOwmDataModel) => {
          this.owmData = data;
          this.owmDataExpired = !this._data.isNotExpired(data);
        }),
        map((data: IOwmDataModel) => ConstantsService.getWeatherBgImg(data.list[0])),
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

  showSettings(settingsButton, isXs: boolean) {
    const dialogWidth = 300;
    const dialogPositionTop = 60;
    const dialogMargin = 75;
    const settingsButtonLeft = settingsButton._elementRef.nativeElement.offsetLeft;
    const settingsButtonoffsetWidth = settingsButton._elementRef.nativeElement.offsetWidth;
    const dialogPositionLeft = settingsButtonLeft + (this.isXs() ? settingsButtonoffsetWidth + 10 : - (dialogWidth + 10));
    const config = {
      panelClass: 'dialog-settings',
      position: {
        top: dialogPositionTop + 'px',
        left: dialogPositionLeft + 'px',
      },
      width: dialogWidth + 'px',
      data: { settingsButton, dialogPositionTop, dialogWidth, dialogMargin, mediaObserver: this.mediaObserver },
      hasBackdrop: true,
    };

    const windowHeight = window.innerHeight;
    if (windowHeight < this.settingsOptions['dialogMaxHeight']) {
      config['height'] = (windowHeight - dialogMargin) + 'px';
    }

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

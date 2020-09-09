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
import { ActivatedRoute, Router, ChildActivationEnd, NavigationEnd, Event } from '@angular/router';
import { MediaObserver } from '@angular/flex-layout';
import { filter, map, tap } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from '../../services/errors.service';
import { AppErrorPayloadModel } from '../../states/app.models';
import { DomSanitizer } from '@angular/platform-browser';
import { MatToolbar } from '@angular/material/toolbar';
import { Select, Store } from '@ngxs/store';
import { IOwmDataModel } from '../../models/owm-data.model';
import { OwmDataManagerService } from '../../services/owm-data-manager.service';
import { AppOwmDataState, AppCitiesState, AppStatusState } from '../../states/app.state';
import { SetStatusSelectedCityIdState } from '../../states/app.actions';
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
  toolbarShow = true;
  loaded = false;
  selectedCityId: string = this._store.selectSnapshot(AppStatusState.selectStatusSelectedCityId) || ConstantsService.defaultCityId;
  iconSettings: string = ConstantsService.iconSettings;
  subscriptions: Subscription;
  showActionButtonsXS = false;
  xs500w = false;
  toolbarHeight: number;
  weatherBackgroundImg: string;
  owmData: IOwmDataModel;
  owmDataExpired = false;
  connected = true;

  @Select(AppOwmDataState.selectOwmData) owmDataSelectedCityLast$: Observable<IOwmDataModel>;
  @Select(AppCitiesState.selectCities) cities$: Observable<ICities>;
  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isXs();
  }

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _data: OwmDataManagerService, // Instantiate service to start listener
    private _store: Store,
    private _errors: ErrorsService,
    private _sanitizer: DomSanitizer,
    public mediaObserver: MediaObserver,
    public dialog: MatDialog
  ) {
    this.subscriptions = this._router.events
      .pipe(
        filter((event: Event) => event instanceof NavigationEnd),
        map((event: ChildActivationEnd) => event['urlAfterRedirects'].split('/').pop() || event['url'].split('/').pop())
      )
      .subscribe(
        (eventPathEndSegment) => {
          if (eventPathEndSegment in ConstantsService.toolbarActions) {
            if (this.toolbarActions !== ConstantsService.toolbarActions[eventPathEndSegment]) {
              this.toolbarActions = ConstantsService.toolbarActions[eventPathEndSegment];
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
    const subscriptionBgImg: Subscription = this.owmDataSelectedCityLast$
      .pipe(
        filter((data) => !!data),
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
    this.connected$.subscribe(connected => {
      this.connected = connected;
    })

    this.subscriptions.add(subscriptionBgImg);
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
    const dialogHeight = 150;
    const settingsButtonLeft = settingsButton._elementRef.nativeElement.offsetLeft;
    const settingsButtonTop = settingsButton._elementRef.nativeElement.offsetTop;
    const settingsButtonHeight = settingsButton._elementRef.nativeElement.clientHeight;
    const settingsButtonoffsetWidth = settingsButton._elementRef.nativeElement.offsetWidth;
    const dialogPositionTop = settingsButtonTop + settingsButtonHeight;
    const dialogPositionLeft = settingsButtonLeft + (this.isXs() ? settingsButtonoffsetWidth : -dialogWidth);

    this.dialog.open(DialogSettingsComponent, {
      panelClass: 'dialog-settings',
      position: {
        top: dialogPositionTop + 'px',
        left: dialogPositionLeft + 'px',
      },
      width: dialogWidth + 'px',
      height: dialogHeight + 'px',
      data: { settingsButton, dialogWidth, dialogHeight, mediaObserver: this.mediaObserver },
      hasBackdrop: true,
    });
  }

  selectedCityChange() {
    this._store.dispatch(new SetStatusSelectedCityIdState(this.selectedCityId));
  }

  addError(custom: string, errorMessage: string) {
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Connection or service problem. Please reload or try later.',
      logMessage: `ForecastComponent: ${custom}: ${errorMessage}`,
    };
    this._errors.add(errorLog);
  }
}

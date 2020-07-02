import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, HostBinding } from '@angular/core';
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
import { IOwmDataModel } from 'src/app/models/owm-data.model';
import { OwmDataService } from 'src/app/services/owm-data.service';
import { AppOwmDataState } from 'src/app/states/app.state';
import { SetStatusSelectedCityIdState } from 'src/app/states/app.actions';

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
  cities: ICities;
  selectedCityId: string = ConstantsService.defaultCityId;
  subscriptions: Subscription;
  showActionButtonsXS = false;
  xs = false;
  toolbarHeight: number;
  weatherBackgroundImg: string;
  owmData: IOwmDataModel;

  @Select(AppOwmDataState.selectOwmData) owmDataSelectedCityLast$: Observable<IOwmDataModel>;

  constructor(
    private _router: Router,
    private _data: OwmDataService,
    private _activatedRoute: ActivatedRoute,
    private _store: Store,
    private _errors: ErrorsService,
    private _sanitizer: DomSanitizer,
    public mediaObserver: MediaObserver
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
    const subscriptionCities: Subscription = this._activatedRoute.data.subscribe(
      data => {
        this.cities = data.cities;
      },
      err => {
        this.addError('header-toolbar: subscriptionCities', err.message);
      }
    );
    this.subscriptions.add(subscriptionCities);
  }

  ngOnInit() {
    const subscriptionBgImg: Subscription = this.owmDataSelectedCityLast$
      .pipe(
        filter(data => !!data),
        tap((data: IOwmDataModel) => this.owmData = data),
        map((data: IOwmDataModel) => ConstantsService.getWeatherBgImg(data)),
        filter((newDataImgPath: string) => {
          const currentBgImgPath = this.container.nativeElement.style['background-image'].split('"')[1];
          return currentBgImgPath !== newDataImgPath;
        })
      )
      .subscribe(
        (imgPath: string) => {
          this.container.nativeElement.style['background-image'] = `url(${imgPath})`;
        },
        (err) => {
          this.addError('header-toolbar: ngOnInit: onChange: subscribe', err.message);
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
    this.showActionButtonsXS = this.isXs() && this.showActionButtonsXS ? false : true;
  }

  hideActionButtonsXS($event) {
    this.showActionButtonsXS = false;
  }

  selectionChange() {
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

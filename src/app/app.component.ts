import { Component, OnDestroy } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { PresenceService } from './services/presence.service';
import { Observable, Subscription } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { Select, Store } from '@ngxs/store';
import { SetStatusBuildInfo, SetStatusShowLoading, SetStatusUpdatesAvailable } from './states/app.actions';
import { ConstantsService } from './services/constants.service';
import { AppStatusState } from './states/app.state';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = 'owm-a11-fb';
  loading = false;
  subscriptions: Subscription;
  @Select(AppStatusState.showLoading) showLoading$: Observable<boolean>;

  constructor(
    private _router: Router,
    private _presence: PresenceService,
    private _updates: SwUpdate,
    private _store: Store
  ) {
    this.initCss();
    this.setSubscribeOnRouterEvents();
    this.setSubscribeOnConnected();
    this.startListenerOnAway();
    this.setSubscribeOnUpdates();
    this.setSubscribeDebounceLoadingActions();
  }

  initCss() {
    [
      'iconArrowWindDirection',
      'iconsMeasures',
      'iconsWeather'
    ].forEach((property) => {
      document.documentElement.style.setProperty(`--${property}Url`, `url("../../../${ConstantsService[property]}")`);
    });
    [
      'showDetailPressure',
      'showDetailWind',
      'showDetailHumidity',
      'showDetailSecondary'
    ].forEach((property) => {
      document.documentElement.style.setProperty('--' + property, this._store.selectSnapshot(AppStatusState[property]) ? 'flex' : 'none');
    });
  }

  setSubscribeDebounceLoadingActions() {
    const subscriptionDespatchLoadingActions = this.showLoading$
      .pipe(debounceTime(ConstantsService.loadingDispatechesDebounceTime_ms))
      .subscribe((loading) => {
        this.loading = loading;
      });
    this.subscriptions.add(subscriptionDespatchLoadingActions);
  }

  setSubscribeOnUpdates() {
    this._store.dispatch(new SetStatusUpdatesAvailable(false));
    this.subscriptions.add(
      this._updates.available.subscribe((event) => {
        console.log('Current version is', event.current);
        console.log('New available version is', event.available);
        this._store.dispatch(new SetStatusUpdatesAvailable(true));
        const buildInfo = {
          current: (event.current?.appData as any)?.buildInfo,
          available: (event.available?.appData as any)?.buildInfo
        };
        this._store.dispatch(new SetStatusBuildInfo(buildInfo));
      })
    );
  }

  startListenerOnAway() {
    this._presence.updateOnAway();
  }

  setSubscribeOnConnected() {
    this.subscriptions.add(
      this._presence.updateOnConnected().subscribe((connected) => console.log('AppComponent connected', connected))
    );
  }

  setSubscribeOnRouterEvents() {
    this.subscriptions = this._router.events.subscribe((routerEvent: Event) => {
      this.checkRouterEvent(routerEvent);
    });
  }

  checkRouterEvent(routerEvent: Event) {
    if (routerEvent instanceof NavigationStart) {
      this._store.dispatch(new SetStatusShowLoading(true));
    }

    if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      this._store.dispatch(new SetStatusShowLoading(false));
    }
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}

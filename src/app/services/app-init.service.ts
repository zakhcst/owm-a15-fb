import { Injectable } from '@angular/core';
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import { SetStatusBuildInfo, SetStatusShowLoading, SetStatusUpdatesAvailable } from '../states/app.actions';
import { AppStatusState } from '../states/app.state';
import { ConstantsService } from './constants.service';
import { DbOwmService } from './db-owm.service';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {
  subscriptions: Subscription;
  
  constructor(
    private _router: Router,
    private _presence: PresenceService,
    private _updates: SwUpdate,
    private _store: Store,
    private _dbOwmData: DbOwmService

  ) { 
    this.initCss();
    this.setSubscribeOnRouterEvents();
    this.setSubscribeOnConnected();
    this.startListenerOnAway();
    this.setSubscribeOnUpdates();
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

}

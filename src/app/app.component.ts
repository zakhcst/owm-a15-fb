import { Component, OnDestroy } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { PresenceService } from './services/presence.service';
import { Subscription } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { Store } from '@ngxs/store';
import { SetStatusUpdatesAvailable } from './states/app.actions';
import { ConstantsService } from './services/constants.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  title = 'owm-a11-fb';
  loading = false;
  subscriptions: Subscription;

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
  }

  initCss() {
    const iconsMeasuresUrl = `url("../../../${ConstantsService.iconsMeasures}")`;
    document.documentElement.style.setProperty('--iconsMeasuresUrl', iconsMeasuresUrl);
    const iconsWeatherUrl = `url("../../../${ConstantsService.iconsWeather}")`;
    document.documentElement.style.setProperty('--iconsWeatherUrl', iconsWeatherUrl);

  }

  setSubscribeOnConnected() {
    this.subscriptions.add(
      this._presence.updateOnConnected().subscribe((connected) => console.log('AppComponent connected', connected))
    );
  }

  startListenerOnAway() {
    this._presence.updateOnAway();
  }

  setSubscribeOnUpdates() {
    this._store.dispatch(new SetStatusUpdatesAvailable(false));
    this.subscriptions.add(
      this._updates.available.subscribe((event) => {
        console.log('current version is', event.current);
        console.log('available version is', event.available);
        this._store.dispatch(new SetStatusUpdatesAvailable(true));
      })
    );
  }

  setSubscribeOnRouterEvents() {
    this.subscriptions = this._router.events.subscribe((routerEvent: Event) => {
      this.checkRouterEvent(routerEvent);
    });
  }

  checkRouterEvent(routerEvent: Event) {
    if (routerEvent instanceof NavigationStart) {
      this.loading = true;
    }

    if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      this.loading = false;
    }
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}

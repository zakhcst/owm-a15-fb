import { Component, OnDestroy } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { PresenceService } from './services/presence.service';
import { Observable, Subscription } from 'rxjs';
import { SwUpdate } from '@angular/service-worker';
import { Select, Store } from '@ngxs/store';
import { SetStatusShowLoading, SetStatusUpdatesAvailable } from './states/app.actions';
import { ConstantsService } from './services/constants.service';
import { AppStatusState } from './states/app.state';
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
  }

  initCss() {
    const iconsMeasuresUrl = `url("../../../${ConstantsService.iconsMeasures}")`;
    document.documentElement.style.setProperty('--iconsMeasuresUrl', iconsMeasuresUrl);
    const iconsWeatherUrl = `url("../../../${ConstantsService.iconsWeather}")`;
    const iconArrowWindDirection = `url("../../../${ConstantsService.iconArrowWindDirection}")`;
    document.documentElement.style.setProperty('--iconArrowWindDirection', iconArrowWindDirection);
    document.documentElement.style.setProperty('--iconsWeatherUrl', iconsWeatherUrl);
    document.documentElement.style.setProperty('--showDetailPressure', this._store.selectSnapshot(AppStatusState.showDetailPressure) ? 'flex' : 'none');
    document.documentElement.style.setProperty('--showDetailWind', this._store.selectSnapshot(AppStatusState.showDetailWind) ? 'flex' : 'none');
    document.documentElement.style.setProperty('--showDetailHumidity', this._store.selectSnapshot(AppStatusState.showDetailHumidity) ? 'flex' : 'none');
    document.documentElement.style.setProperty('--showDetailSecondary', this._store.selectSnapshot(AppStatusState.showDetailSecondary) ? 'flex' : 'none');

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
        console.log('Current version is', event.current);
        console.log('New available version is', event.available);
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

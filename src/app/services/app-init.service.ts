import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SwUpdate, VersionInstallationFailedEvent, VersionReadyEvent } from '@angular/service-worker';
import { Store } from '@ngxs/store';
import { Subscription } from 'rxjs';
import {
  SetStatusAway,
  SetStatusBuildInfo,
  SetStatusConnected,
  SetStatusUpdatesAvailable,
} from '../states/app.actions';
import { AppStatusState } from '../states/app.state';
import { ConstantsService } from './constants.service';
import { OwmDataManagerService } from './owm-data-manager.service';
import { SnackbarService } from './snackbar.service';
import { PresenceService } from './presence.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { DbOwmService } from './db-owm.service';
import { CitiesService } from './cities.service';
import { GetBrowserIpService } from './get-browser-ip.service';
import { HistoryLogService } from './history-log.service';
import { StatsService } from './stats.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  subscriptions = new Subscription();

  constructor(
    private _presence: PresenceService,
    private _updates: SwUpdate,
    private _store: Store,
    private _owmDataManager: OwmDataManagerService,
    private _snackbarService: SnackbarService,
    private _dbOwmService: DbOwmService,
    private _citiesService: CitiesService,
    private _getBrowserIpService: GetBrowserIpService,
    private _historyLogService: HistoryLogService,
    private _statsService: StatsService,
    private _router: Router,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.initCss();
    this.setSubscribeOnConnected();
    this.startListenerOnAway();
    this.setSubscribeOnUpdates();
  }

  initCss() {
    ConstantsService.initCssIconsList.forEach((property) => {
      this._document.documentElement.style.setProperty(
        `--${property}Url`,
        `url("../../../${ConstantsService[property]}")`
      );
    });
    ConstantsService.initCssShowPropertiesList.forEach((property) => {
      const display = (this._store.selectSnapshot(AppStatusState[property]) && 'flex') || 'none';
      this._document.documentElement.style.setProperty('--' + property, display);
    });
  }

  setSubscribeOnUpdates() {
    this.subscriptions.add(
      this._updates.versionUpdates.subscribe((event: VersionReadyEvent|VersionInstallationFailedEvent) => {
        if (event.type === 'VERSION_READY') {
          console.log('Current version:', event.currentVersion.hash);
          console.log('New available version:', event.latestVersion.hash);
          this._store.dispatch(new SetStatusUpdatesAvailable(true));
          
          const buildInfo = {
            current: (event.currentVersion.appData as any)?.buildInfo,
            available: (event.latestVersion?.appData as any)?.buildInfo,
          };
          this._store.dispatch(new SetStatusBuildInfo(buildInfo));
        }
        if (event.type === 'VERSION_INSTALLATION_FAILED') {
          this._router.navigate(['error', {errorMessage: 'VERSION INSTALLATION FAILED, PLEASE RELOAD APP.', redirectPage: ''}]);
        }

      })
    );
  }

  startListenerOnAway() {
    const fn = () => {
      const away = this._document.visibilityState === 'hidden';
      this._store.dispatch(new SetStatusAway(away));
    };
    this._presence.updateOnAway(fn);
  }

  setSubscribeOnConnected() {
    this.subscriptions.add(
      this._presence
        .updateOnConnected()
        .pipe(
          distinctUntilChanged((prev, curr) => {
            return prev === curr;
          })
        )
        .subscribe((connected) => {
          console.log('AppComponent connected', connected);
          this._store.dispatch(new SetStatusConnected(!!connected));
        })
    );
  }

  shutdown() {
    this._store.dispatch(new SetStatusConnected(false));
    this._store.dispatch(new SetStatusAway(false));
    this.subscriptions.unsubscribe();
    this._dbOwmService.shudown();
    this._citiesService.shudown();
    this._getBrowserIpService.shudown();
    this._historyLogService.shudown();
    this._owmDataManager.shudown();
    this._statsService.shudown();
    console.log('shutdown()');
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';
import { merge, Observable, of, timer } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';
import { ConstantsService } from '../../services/constants.service';
import { filter, mapTo, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CanActivateGchart implements CanActivate {
  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  canActivate(): Observable<boolean> {
    const timeout = timer(ConstantsService.connectedResponseTimeout_ms).pipe(mapTo(false));
    const connected = this.connected$.pipe(filter((status) => status));
    return ConstantsService.toolbarElements.forecastGChart['disableOnDisconnected']
      ? merge(connected, timeout).pipe(take(1))
      : of(true);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CanLoadGchart implements CanLoad {
  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  canLoad(): Observable<boolean> {
    const timeout = timer(ConstantsService.connectedResponseTimeout_ms).pipe(mapTo(false));
    const connected = this.connected$.pipe(filter((status) => status));
    return ConstantsService.toolbarElements.forecastGChart['disableOnDisconnected']
      ? merge(connected, timeout).pipe(take(1))
      : of(true);
  }
}


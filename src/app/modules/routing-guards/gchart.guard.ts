import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanLoad } from '@angular/router';
import { interval, merge, Observable, of } from 'rxjs';
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
    const timeout = interval(ConstantsService.connectedResponseTimeLimit_ms).pipe(take(1), mapTo(false));
    const connected = this.connected$.pipe(filter((status) => status));
    return ConstantsService.toolbarElements.forecastGChart['disableOnDisconnected']
      ? merge(connected, timeout).pipe(take(1))
      : of(true);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CanLoadGChart implements CanLoad {
  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  canLoad(): Observable<boolean> {
    const timeout = interval(ConstantsService.connectedResponseTimeLimit_ms).pipe(take(1), mapTo(false));
    const connected = this.connected$.pipe(filter((status) => status));
    return ConstantsService.toolbarElements.forecastGChart['disableOnDisconnected']
      ? merge(connected, timeout).pipe(take(1))
      : of(true);
  }
}


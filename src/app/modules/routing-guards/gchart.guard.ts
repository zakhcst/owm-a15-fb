import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  CanLoad,
} from '@angular/router';
import { interval, merge, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';
import { ConstantsService } from '../../services/constants.service';
import { debounce, filter, mapTo, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CanActivateGchart implements CanActivate {
  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.connectedStatus();
  }
  connectedStatus() {
    const timeout = interval(1000).pipe(mapTo(false));
    const connected = this.connected$.pipe(filter(status => status));
    return ConstantsService.toolbarElements.forecastGChart['disableOnDisconnected'] ? merge(connected, timeout).pipe(take(1)) : true;
  }
}

@Injectable({
  providedIn: 'root',
})
export class CanLoadGChart implements CanLoad {
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  
  canLoad(): Observable<boolean> | Promise<boolean> | boolean {
    return this.connectedStatus();
  }
  connectedStatus() {
    const timeout = interval(1000).pipe(mapTo(false));
    const connected = this.connected$.pipe(filter(status => status));
    return ConstantsService.toolbarElements.forecastGChart['disableOnDisconnected'] ? merge(connected, timeout).pipe(take(1)) : true;
  }
}

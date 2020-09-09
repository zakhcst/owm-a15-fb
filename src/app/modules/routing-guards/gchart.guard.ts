import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';
import { ConstantsService } from '../../services/constants.service';

@Injectable({
  providedIn: 'root'
})
export class GchartGuard implements CanActivate {

  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return ConstantsService.views.forecastGChart['disableOnDisconnected'] ? this.connected$ : true;
  }

}

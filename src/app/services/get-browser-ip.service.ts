import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { of, Observable, throwError, Subscription } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { Select, Store } from '@ngxs/store';
import { AppStatusState } from '../states/app.state';
import { SetStatusIpState } from '../states/app.actions';
@Injectable({
  providedIn: 'root',
})
export class GetBrowserIpService {
  getIPv4Subscription: Subscription;

  @Select(AppStatusState.connected) connected$: Observable<boolean>;

  constructor(private _http: HttpClient, private _errors: ErrorsService, private _store: Store) {
    this.refreshIpOnConnect();
  }

  getIPv4() {
    return this.requestIPv4().pipe(
      switchMap(this.validateIPv4.bind(this)),
      catchError((errIp) => {
        return of('255.255.255.255');
      })
    );
  }

  requestIPv4(): Observable<string> {
    return this._http.get(ConstantsService.getIpUrl, { responseType: 'text' }).pipe(
      take(1),
      catchError((err) => {
        this.setIPv4Error(err.message || err);
        return throwError('--ip-error-connection');
      })
    );
  }

  validateIPv4(ipString: string): Observable<string> {
    if (ConstantsService.ipv4RE.test(ipString)) {
      return of(ipString);
    }
    this.setIPv4Error('IPv4 validation error');
    return throwError('--ip-error-validation');
  }

  setIPv4Error(error?: string) {
    this._errors.add({
      userMessage: 'Connection or service problem',
      logMessage: 'GetBrowserIpService: getIPv4: ' + error,
    });
  }

  refreshIpOnConnect() {
    this.connected$
      .subscribe((connected) => {
        if (!connected) {
          this._store.dispatch([new SetStatusIpState('0.0.0.0')]);
          return;
        }

        if (this.getIPv4Subscription) {
          this.getIPv4Subscription.unsubscribe();
        }
        this.getIPv4Subscription = this.getIPv4().subscribe((ip: string) => {
          this._store.dispatch([new SetStatusIpState(ip)]);
        });
      });
  }
}

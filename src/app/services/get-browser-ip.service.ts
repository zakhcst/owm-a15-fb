import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { of, Observable, Subscription, throwError } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { Select, Store } from '@ngxs/store';
import { AppStatusState } from '../states/app.state';
import { SetStatusIp } from '../states/app.actions';
@Injectable({
  providedIn: 'root',
})
export class GetBrowserIpService {
  @Select(AppStatusState.connected) connected$: Observable<boolean>;
  connectedSubscription: Subscription;

  constructor(private _http: HttpClient, private _errors: ErrorsService, private _store: Store) {
    this.refreshIpOnConnect();
  }

  getIPv64() {
    return this.requestIPv64().pipe(
      switchMap(this.validateIP.bind(this)),
      catchError((errIp: any) => {
        return of('255.255.255.255');
      })
    );
  }

  requestIPv64(): Observable<string> {
    return this._http.get(ConstantsService.getIPv64Url, { responseType: 'text' }).pipe(
      take(1),
      catchError((err) => {
        this.setIPConnectionError(err.message || err);
        // return of('--ip-error-connection');
        return throwError(() => new Error('--ip-error-connection'))
      })
    );
  }

  validateIP(ipString: string): Observable<string> {
    if (ConstantsService.ipv4RE.test(ipString)) {
      return of(ipString);
    }
    if (ConstantsService.ipv6RE.test(ipString)) {
      return of(ipString);
    }
    this.setIPValidationError('IP validation error');
    return throwError(() => new Error('--ip-error-validation'));
  }

  setIPConnectionError(error?: string) {
    this._errors.add({
      userMessage: 'Connection or service problem',
      logMessage: 'GetBrowserIpService: Connection or service: getIPv64: ' + error,
    });
  }

  setIPValidationError(error?: string) {
    this._errors.add({
      userMessage: 'Validation or service problem',
      logMessage: 'GetBrowserIpService: getIPv64: ' + error,
    });
  }

  refreshIpOnConnect() {
    this.connectedSubscription = this.connected$.subscribe((connected) => {
      if (!connected) {
        this._store.dispatch([new SetStatusIp('0.0.0.0')]);
        return;
      }
      this.refreshIp();
    });
  }

  refreshIp() {
    this.getIPv64().subscribe((ip: string) => {
      this._store.dispatch([new SetStatusIp(ip)]);
    });
  }
  
}

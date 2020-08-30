import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { of, Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
@Injectable({
  providedIn: 'root',
})
export class GetBrowserIpService {

  constructor(private _http: HttpClient, private _errors: ErrorsService) {}

  getIPv4() {
    return this.requestIPv4().pipe(switchMap(this.validateIPv4.bind(this)));
  }

  requestIPv4(): Observable<string> {
    return this._http.get(ConstantsService.getIpUrl, { responseType: 'text' }).pipe(
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
}

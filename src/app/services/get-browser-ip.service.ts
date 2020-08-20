import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { of, Observable } from 'rxjs';
import { switchMap, catchError, shareReplay } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
@Injectable({
  providedIn: 'root',
})
export class GetBrowserIpService {
  private _cache$: Observable<string>;
  private ipError = false;

  constructor(private _http: HttpClient, private _errors: ErrorsService) { }

  getIP() {
    if (!this._cache$ || this.ipError) {
      this._cache$ = this.requestIP().pipe(
        switchMap(this.validateIP),
        catchError((err) => {
          this._errors.add({
            userMessage: 'Connection or service problem',
            logMessage: 'GetBrowserIpService: getIP: Connection or service problem ' + err.message,
          });
          return this.setIPError();
        }),
        shareReplay(1)
      );
    }
    return this._cache$;
  }

  requestIP(): Observable<string> {
    return this._http.get(ConstantsService.getIpUrl, { responseType: 'text' });
  }

  validateIP(ipString: string): Observable<string> {
    if (ConstantsService.ipv4RE.test(ipString)) {
      this.ipError = false;
      return of(ipString);
    }
    return this.setIPError('IP validation error');
  }

  setIPError(error?: string) {
    this.ipError = true;
    return of(error || 'ip-error');
  }

  requestIPv4(): Observable<string> {
    return this._http.get(ConstantsService.getIpUrl, { responseType: 'text' }).pipe(
      catchError((err) => {
        this.setIPv4Error(err.message);
        return of('ip-error');
      }));
  }

  validateIPv4(ipString: string): Observable<string> {
    if (ConstantsService.ipv4RE.test(ipString)) {
      return of(ipString);
    }
    this.setIPv4Error('IPv4 validation error');
    return of('ip-error');
  }

  setIPv4Error(error?: string) {
    this._errors.add({
      userMessage: 'Connection or service problem',
      logMessage: 'GetBrowserIpService: getIP: ' + error
    });
  }

}

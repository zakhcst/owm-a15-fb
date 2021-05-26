import { Injector, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root'
})
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private injector: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        retry(1),
        catchError((error: HttpErrorResponse) => {
          const _errors = this.injector.get(ErrorsService);
          let errorMessage = '';
          
          if (error.error) {
            errorMessage = `Client Error: ${JSON.stringify(error.error.message)} \n ${error.error}`;
          } else {
            errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
          }
          _errors.add({
            userMessage: 'Connection or service problem',
            logMessage: 'HttpInterceptorService: ' + errorMessage
          });

          return throwError(errorMessage);
        })
      );
  }
}

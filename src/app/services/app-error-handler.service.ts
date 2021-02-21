import { Injectable, ErrorHandler, Injector, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorsService } from './errors.service';
import { AppErrorPayloadModel } from '../states/app.models';


@Injectable({
  providedIn: 'root'
})
export class AppErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector, private ngZone: NgZone) { }

  handleError(error) {
    const router = this.injector.get(Router);
    const _errors = this.injector.get(ErrorsService);
    console.log('handleError');
    console.log(error);
    const errorLog: AppErrorPayloadModel = {
      userMessage: 'Client error. Please reload or try later.',
      logMessage: `Client error:\n ${error.message}:\n ${error}`
    };
    _errors.add(errorLog);
    this.ngZone.run(() => router.navigate(['error', {errorMessage: error, redirectPage: ''}]));
  }
}

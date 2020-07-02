import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { catchError } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { throwError, Observable } from 'rxjs';
import { IOwmDataModel } from '../models/owm-data.model';
@Injectable({
  providedIn: 'root'
})
export class OwmFallbackDataService {
  constructor(private _http: HttpClient, private _errors: ErrorsService) {}

  getData(): Observable<IOwmDataModel> {
    return this._http.get<IOwmDataModel>(ConstantsService.owmFallbackData).pipe(
      // logs error at this level and rethrows for component err log
      catchError(err => {
        this._errors.add({
          userMessage: 'Connection or service problem',
          logMessage: 'OwmFallbackDataService: getData: ' + err.message
        });
        return throwError(err);
      }));
  }
}

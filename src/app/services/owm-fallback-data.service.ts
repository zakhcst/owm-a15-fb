import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { catchError, take } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { throwError, Observable } from 'rxjs';
import { IOwmDataModel } from '../models/owm-data.model';
@Injectable({
  providedIn: 'root'
})
export class OwmFallbackDataService {
  constructor(private _http: HttpClient, private _errors: ErrorsService) { }

  getData(): Observable<IOwmDataModel> {
    return this._http.get<IOwmDataModel>(ConstantsService.owmFallbackData).pipe(
      take(1),
      catchError(error => {
        this._errors.add({
          userMessage: 'Connection or service problem', logMessage: 'OwmFallbackDataService: getData: ' + error.message
        });
        return throwError(() => new Error(error));
      }));
  }
}

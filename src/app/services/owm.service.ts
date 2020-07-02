import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { IOwmDataModel } from '../models/owm-data.model';

@Injectable({
  providedIn: 'root'
})
export class OwmService {
  constructor(private _http: HttpClient, private _errors: ErrorsService) {}

  getData(cityId: string): Observable<IOwmDataModel> {
    const owmRequestUrl =
      ConstantsService.default5DayForecastUrl +
      '?id=' +
      cityId +
      '&units=' +
      ConstantsService.defaultUnits +
      '&APPID=' +
      ConstantsService.defaultAPPID;

    return this._http.get<IOwmDataModel>(owmRequestUrl)
    .pipe(
      catchError(err => {
        // openweathermap.org/faq
        // Q: API calls return an error 429
        // A: You will get the error 429 if you have FREE tariff and make more than 60 API calls per minute
        // To do update error message at quota error
        if (err.code === 429) {
          this._errors.add({
            userMessage: 'FREE tariff, make more than 60 API calls per minute exceeded!',
            logMessage: 'OwmService: FREE tariff, make more than 60 API calls per minute exceeded!' + err.message
          });
        }
        return throwError(err);
      })
    );
  }
}

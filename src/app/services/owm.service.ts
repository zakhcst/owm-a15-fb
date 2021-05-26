import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstantsService } from './constants.service';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorsService } from './errors.service';
import { IOwmDataModel } from '../models/owm-data.model';

@Injectable({
  providedIn: 'root',
})
export class OwmService {
  constructor(private _http: HttpClient, private _errors: ErrorsService) {}

  httpGet(owmRequestUrl: string) {
    return this._http.get<IOwmDataModel>(owmRequestUrl);
  }

  getData(cityId: string): Observable<IOwmDataModel> {
    const owmRequestUrl =
      ConstantsService.default5DayForecastUrl +
      '?id=' +
      cityId +
      '&units=' +
      ConstantsService.defaultUnits +
      '&APPID=' +
      ConstantsService.defaultAPPID;

    return this.httpGet(owmRequestUrl).pipe(
      catchError((error) => {
        // openweathermap.org/faq
        // Q: API calls return an error 429
        // A: You will get the error 429 if you have FREE tariff and make more than 60 API calls per minute
        // To do update error message at quota error
        if (error.code === 429) {
          this._errors.add({
            userMessage: 'FREE tariff, 60 API calls per minute quota exceeded!',
            logMessage: 'OwmService: FREE tariff, 60 API calls per minute quota exceeded!' + error,
          });
        } else {
          this._errors.add({
            userMessage: 'OwmService API error',
            logMessage: 'OwmService: API error' + error,
          });
        }

        return throwError(error);
      })
    );
  }
}

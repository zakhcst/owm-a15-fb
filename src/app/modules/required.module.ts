import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { environment } from '../../environments/environment';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import {
  AppOwmDataCacheState,
  AppErrorsState,
  AppStatusState,
  AppCitiesState,
  AppStatsState,
  AppHistoryLogState,
  AppFallbackDataState,
} from '../states/app.state';
import { ConstantsService } from '../services/constants.service';

function setRequiredKeysAfterDeserialize(obj, state: string) {
  if (state === 'status') {
    const keysToBeSet = [
      'showDetailTimeSlotBgPicture',
      'showDetailSecondary',
      'showDetailPressure',
      'showDetailWind',
      'showDetailHumidity',
      'showGChartWind',
      'showGChartHumidity',
      'showGChartIcons'
    ];
    keysToBeSet.forEach(key => {
      obj[key] = obj[key] ?? true;
    });
    obj['daysForecast'] = obj['daysForecast'] ?? 5;
    obj['selectedCityId'] = obj['selectedCityId'] ?? ConstantsService.defaultCityId;

  }
  return obj;
}
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    NgxsModule.forRoot(
      [
        AppStatusState,
        AppOwmDataCacheState,
        AppCitiesState,
        AppStatsState,
        AppHistoryLogState,
        AppFallbackDataState,
        AppErrorsState,
      ],
      { developmentMode: !environment.production }
    ),
    NgxsStoragePluginModule.forRoot({
      key: ['status', 'owmDataCache', 'cities', 'stats', 'historyLog', 'fallbackData'],
      afterDeserialize: setRequiredKeysAfterDeserialize
    }),
  ],
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule,
    AngularFireDatabaseModule,
    NgxsModule,
  ],
})
export class RequiredModules { }

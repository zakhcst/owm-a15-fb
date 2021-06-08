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
  AppPopupMessages
} from '../states/app.state';
import { ConstantsService } from '../services/constants.service';

export function setRequiredKeysAfterDeserialize(obj, state: string) {
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
    obj['popupType'] = obj['popupType'] ?? 1;
    obj['selectedCityId'] = obj['selectedCityId'] ?? ConstantsService.defaultCityId;
    obj['away'] = false;
    obj['connected'] = false;
    obj['updatesAvailable'] = false;

  }
  return obj;
}

@NgModule({
  imports: [
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
        AppPopupMessages,
      ],
      { developmentMode: !environment.production }
    ),
    NgxsStoragePluginModule.forRoot({
      key: ['status', 'owmDataCache', 'cities', 'stats', 'historyLog', 'fallbackData'],
      afterDeserialize: setRequiredKeysAfterDeserialize
    }),
  ],
  exports: [
    AngularFireModule,
    AngularFireDatabaseModule,
    NgxsModule,
  ],
})
export class InitModules { }

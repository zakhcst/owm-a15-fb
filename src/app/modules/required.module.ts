import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { environment } from '../../environments/environment';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { AppHistoryState, AppErrorsState, AppStatusState, AppOwmDataState, AppCitiesState, AppStatsState } from '../states/app.state';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    NgxsModule.forRoot([AppHistoryState, AppErrorsState, AppOwmDataState, AppStatusState, AppCitiesState, AppStatsState],
      { developmentMode: !environment.production }),
    NgxsStoragePluginModule.forRoot({ key: ['status', 'cities', 'history', 'data', 'stats']}),
  ],
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule,
    AngularFireDatabaseModule,
    NgxsModule,
  ]
})

export class RequiredModules { }

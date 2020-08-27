import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { environment } from '../../environments/environment';
import { NgxsModule } from '@ngxs/store';
import { AppHistoryState, AppErrorsState, AppStatusState, AppOwmDataState } from '../states/app.state';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    NgxsModule.forRoot([AppHistoryState, AppErrorsState, AppOwmDataState, AppStatusState],
      { developmentMode: !environment.production }),
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

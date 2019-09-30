import { NgModule, ErrorHandler } from '@angular/core';

import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

import { RequiredModules } from './modules/required-modules';

import { AppComponent } from './app.component';
import { AppSnackBarInnerComponent } from './components/app-snack-bar-inner/app-snack-bar-inner.component';
import { AppRoutingModule } from './modules/routing.module';
import { AppErrorHandlerService } from './services/app-error-handler.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpInterceptorService } from './services/http-interceptor.service';


@NgModule({
  declarations: [AppComponent, AppSnackBarInnerComponent],

  imports: [
    HttpClientModule,
    RequiredModules,
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot(),
    AppRoutingModule
  ],
  exports: [RequiredModules],
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandlerService },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    }
  ],
  entryComponents: [AppSnackBarInnerComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}

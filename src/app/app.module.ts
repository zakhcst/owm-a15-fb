import { NgModule, ErrorHandler } from '@angular/core';

import { RequiredModules } from './modules/required.module';
import { AdditionalModules } from './modules/additional.module';

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
    AdditionalModules,
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

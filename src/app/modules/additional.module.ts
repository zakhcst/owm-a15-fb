import { NgModule } from '@angular/core';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
// import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
// import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

@NgModule({
  imports: [
    NgxsReduxDevtoolsPluginModule.forRoot(),
    // NgxsLoggerPluginModule.forRoot(),
    // NgxsRouterPluginModule.forRoot(),
  ],
  exports: [
    NgxsReduxDevtoolsPluginModule,
    // NgxsLoggerPluginModule,
    // NgxsRouterPluginModule,
  ]
})
export class AdditionalModules { }

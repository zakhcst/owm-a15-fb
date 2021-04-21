import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { ConstantsService } from '../services/constants.service';
import { HeaderToolbarComponent } from '../components/header-toolbar/header-toolbar.component';
import { HeaderToolbarModule } from '../components/header-toolbar/header-toolbar.module';
import { ErrorPageComponent } from '../components/error-page/error-page.component';
import { ResolverCitiesService } from './routing-resolvers/resolver-cities.service';
import { ResolverRegisterIconsService } from './routing-resolvers/resolver-register-icons.service';
import { ResolverIpService } from './routing-resolvers/resolver-ip.service';
import { ResolverFallbackService } from './routing-resolvers/resolver-fallback.service';
import { CanActivateGchart, CanLoadGchart } from './routing-guards/gchart.guard';

export const appRoutes: Routes = [
  {
    path: 'v1',
    component: HeaderToolbarComponent,
    resolve: {
      initCitiesService: ResolverCitiesService,
      initIpService: ResolverIpService,
      icons: ResolverRegisterIconsService,
      fallbackData: ResolverFallbackService,
    },
    children: [
      {
        path: ConstantsService.toolbarElements.stats.path,
        loadChildren: () => import('src/app/components/stats/stats.module').then((m) => m.StatsModule),
        pathMatch: 'full',
      },
      {
        path: ConstantsService.toolbarElements.forecastFlex.path,
        loadChildren: () =>
          import('src/app/components/forecast-flex/forecast-flex.module').then((m) => m.ForecastFlexModule),
        pathMatch: 'full',
      },
      {
        path: ConstantsService.toolbarElements.forecastGChart.path,
        canActivate: [CanActivateGchart],
        canLoad: [CanLoadGchart],
        loadChildren: () =>
          import('src/app/components/forecast-gchart/forecast-gchart.module').then((m) => m.ForecastGChartModule),
        pathMatch: 'full',
      },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ],
  },
  {
    path: 'home',
    loadChildren: () => import('src/app/components/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    data: { errorMessage: ' Error Page', redirectPage: '' },
  },
  { path: '', redirectTo: '/v1/' + ConstantsService.toolbarElements.forecastFlex.path, pathMatch: 'full' },
  {
    path: '**',
    component: ErrorPageComponent,
    data: { errorMessage: ' Page Not Found', redirectPage: '' },
  },
];

@NgModule({
  declarations: [ErrorPageComponent],
  imports: [
    RouterModule.forRoot(appRoutes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
    }),
    HeaderToolbarModule,
  ],
  exports: [RouterModule],
  providers: [CanActivateGchart, CanLoadGchart],
})
export class AppRoutingModule {}

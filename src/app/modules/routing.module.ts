import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SharedModule } from './shared.module';
import { HeaderToolbarComponent } from '../components/header-toolbar/header-toolbar.component';
import { HeaderToolbarModule } from '../components/header-toolbar/header-toolbar.module';
import { ErrorPageComponent } from '../components/error-page/error-page.component';
import { HomeModule } from '../components/home/home.module';
import { ConstantsService } from '../services/constants.service';
import { ResolverCitiesService } from './routing-resolvers/resolver-cities.service';
import { ResolverRegisterIconsService } from './routing-resolvers/resolver-register-icons.service';
import { ResolverIpService } from './routing-resolvers/resolver-ip.service';
import { ResolverFallbackService } from './routing-resolvers/resolver-fallback.service';
import { CanActivateGchart, CanLoadGChart } from './routing-guards/gchart.guard';

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
        path: ConstantsService.views.stats.path,
        loadChildren: () => import('src/app/components/stats/stats.module').then((m) => m.StatsModule),
        pathMatch: 'full',
      },
      {
        path: ConstantsService.views.forecastFlex.path,
        loadChildren: () =>
          import('src/app/components/forecast-flex/forecast-flex.module').then((m) => m.ForecastFlexModule),
        pathMatch: 'full',
      },
      {
        path: ConstantsService.views.forecastGChart.path,
        canActivate: [CanActivateGchart],
        canLoad: [CanLoadGChart],
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
    data: { errorMessage: ' Error Page', redirectPage: 'home' },
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '**',
    component: ErrorPageComponent,
    data: { errorMessage: ' Page Not Found', redirectPage: 'home' },
  },
];

@NgModule({
  declarations: [ErrorPageComponent],
  imports: [
    RouterModule.forRoot(appRoutes, {
      preloadingStrategy: PreloadAllModules,
      // ,  enableTracing: true // debugging only
    }),
    HeaderToolbarModule,
    HomeModule,
  ],
  exports: [SharedModule, RouterModule],
  providers: [CanActivateGchart, CanLoadGChart],
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from './shared.module';
import { HeaderToolbarComponent } from '../components/header-toolbar/header-toolbar.component';
import { HeaderToolbarModule } from '../components/header-toolbar/header-toolbar.module';
import { ErrorPageComponent } from '../components/error-page/error-page.component';
import { HomeModule } from '../components/home/home.module';
import { ConstantsService } from '../services/constants.service';
import { ResolverCitiesService } from './routing-resolvers/resolver-cities.service';


const appRoutes: Routes = [
  {
    path: 'v1',
    component: HeaderToolbarComponent,
    resolve: {
      cities: ResolverCitiesService,
    },
    children: [
      {
        path: ConstantsService.views.stats.path,
        loadChildren: () =>
          import('src/app/components/stats/stats.module').then(
            m => m.StatsModule
          ),
        pathMatch: 'full'
      },
      {
        path: ConstantsService.views.forecastFlex.path,
        loadChildren: () =>
          import('src/app/components/forecast-flex/forecast-flex.module').then(
            m => m.ForecastFlexModule
          ),
        pathMatch: 'full'
      },
      {
        path: ConstantsService.views.forecastGChart.path,
        loadChildren: () =>
          import(
            'src/app/components/forecast-gchart/forecast-gchart.module'
          ).then(m => m.ForecastGChartModule),
        pathMatch: 'full'
      },
      { path: '', redirectTo: '/home', pathMatch: 'full' }
    ]
  },
  {
    path: 'home',
    loadChildren: () =>
      import('src/app/components/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    data: { errorMessage: ' Error Page', redirectPage: 'home' }
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '**',
    component: ErrorPageComponent,
    data: { errorMessage: ' Page Not Found', redirectPage: 'home' }
  }
];

@NgModule({
  declarations: [ErrorPageComponent],
  imports: [
    SharedModule,
    RouterModule.forRoot(
      appRoutes
      // , { enableTracing: true } // debugging only
    ),
    HeaderToolbarModule,
    HomeModule
  ],
  exports: [SharedModule, RouterModule]
})
export class AppRoutingModule {}

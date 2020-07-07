import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GoogleChartsModule } from 'angular-google-charts';

import { SharedModule } from '../../modules/shared.module';
import { ForecastGChartComponent } from './forecast-gchart.component';
import { ForecastGchartLegendComponent } from '../forecast-gchart-legend/forecast-gchart-legend.component';

const componentRoutes: Routes = [
  {
    path: '',
    component: ForecastGChartComponent,
  },
];

@NgModule({
  declarations: [ForecastGChartComponent, ForecastGchartLegendComponent],
  imports: [RouterModule.forChild(componentRoutes), SharedModule, GoogleChartsModule.forRoot()],
  exports: [RouterModule],
})
export class ForecastGChartModule {}

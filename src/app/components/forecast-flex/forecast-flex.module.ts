import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../modules/shared.module';
import { ForecastFlexComponent } from './forecast-flex.component';
import { DataCellComponent } from '../data-cell/data-cell.component';

const componentRoutes: Routes = [
  {
    path: '',
    component: ForecastFlexComponent,
  }
];

@NgModule({
  declarations: [ForecastFlexComponent, DataCellComponent],
  imports: [RouterModule.forChild(componentRoutes), SharedModule],
  exports: [RouterModule]
})
export class ForecastFlexModule {}

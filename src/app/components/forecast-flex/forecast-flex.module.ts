import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../../modules/shared.module';
import { ForecastFlexComponent } from './forecast-flex.component';
import { DataCellComponent } from '../data-cell/data-cell.component';
import { DataCellExpandedComponent } from '../data-cell-expanded/data-cell-expanded.component';

const componentRoutes: Routes = [
  {
    path: '',
    component: ForecastFlexComponent,
  }
];

@NgModule({
  declarations: [ForecastFlexComponent, DataCellComponent, DataCellExpandedComponent],
  imports: [RouterModule.forChild(componentRoutes), SharedModule],
  exports: [RouterModule],
  entryComponents: [DataCellExpandedComponent]
})
export class ForecastFlexModule {}

import { NgModule } from '@angular/core';
import { SortCitiesPipe } from 'src/app/pipes/sort-cities.pipe';
import { AngularMaterialModule } from './angular-material/angular-material.module';
import { LayoutsModules } from './layouts/layouts.modules';
import { ReplacePipe } from '../pipes/replace.pipe';
import { SortKeysPipe } from '../pipes/sort-keys.pipe';
import { SliceArrayPipe } from '../pipes/slice-array.pipe';

@NgModule({
  declarations: [
    SortCitiesPipe,
    ReplacePipe,
    SortKeysPipe,
    SliceArrayPipe,
  ],
  imports: [
    AngularMaterialModule,
    LayoutsModules,
  ],
  exports: [
    AngularMaterialModule,
    LayoutsModules,
    ReplacePipe,
    SliceArrayPipe,
    SortCitiesPipe,
    SortKeysPipe,
  ]
})
export class SharedModule { }

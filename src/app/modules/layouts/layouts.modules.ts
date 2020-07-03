import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutXxsvDirective } from './layout-xxsv.directive';

@NgModule({
  declarations: [LayoutXxsvDirective],
  imports: [FlexLayoutModule.withConfig({
    disableDefaultBps: true
  }, 
  []
)],
  exports: [FlexLayoutModule, LayoutXxsvDirective],
})

export class LayoutsModules {}

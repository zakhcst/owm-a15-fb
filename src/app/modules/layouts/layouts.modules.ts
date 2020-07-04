import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LayoutXxsvDirective } from './layout-xxsv.directive';
import { CustomBreakPointsProvider } from './custom-breakpoints';

@NgModule({
  declarations: [LayoutXxsvDirective],
  imports: [FlexLayoutModule.withConfig({
    disableDefaultBps: true
  },
    []
  )],
  exports: [FlexLayoutModule, LayoutXxsvDirective],
  providers: [
    CustomBreakPointsProvider,
  ]
})

export class LayoutsModules { }

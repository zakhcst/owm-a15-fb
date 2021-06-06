import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
// import { LayoutXxsvDirective } from './layout-xxsv.directive.xts';
import { CustomBreakPointsProvider } from './custom-breakpoints';

@NgModule({
  // declarations: [LayoutXxsvDirective],
  imports: [FlexLayoutModule.withConfig({
    disableDefaultBps: true
  },
    []
  )],
  // exports: [FlexLayoutModule, LayoutXxsvDirective],
  exports: [FlexLayoutModule],
  providers: [
    CustomBreakPointsProvider,
  ]
})

export class LayoutsModules { }

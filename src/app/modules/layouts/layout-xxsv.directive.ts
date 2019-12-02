import { Directive } from '@angular/core';
import { LayoutDirective } from '@angular/flex-layout';

// eXtra eXtra Small Vertical
const selector = `[fxLayout.xxsv]`;
const inputs = ['fxLayout.xxsv'];

@Directive({selector, inputs})
export class LayoutXxsvDirective extends LayoutDirective {
  protected inputs = inputs;
}

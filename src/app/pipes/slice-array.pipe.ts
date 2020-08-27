import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceArray'
})
export class SliceArrayPipe implements PipeTransform {

  transform(value: [], arg: number): any[] {
    return arg === 0 ? value.slice(arg) : value.slice(0, arg);
  }

}

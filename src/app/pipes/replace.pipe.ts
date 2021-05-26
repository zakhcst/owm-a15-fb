import { Pipe, PipeTransform } from '@angular/core';
import { strict } from 'assert';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, ...args: any): string {
    return (value || '').split('').map((ch: string) => (ch === args[0]) ? args[1] : ch).join('');
  }
}

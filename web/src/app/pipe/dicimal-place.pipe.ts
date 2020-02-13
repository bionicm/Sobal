import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dicimalPlace'
})
export class DicimalPlacePipe implements PipeTransform {

  transform(value: number, dicimalPlace: number): any {
    if (value && dicimalPlace >= 0) {
      const radix = Math.pow(10, dicimalPlace);
      const n = Math.round(value * radix) / radix;
      return n.toFixed(dicimalPlace);
    }
    return value;
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { WidgetTypeOption } from '../interface/widget';

@Pipe({
  name: 'optionName'
})
export class OptionNamePipe implements PipeTransform {
  transform(value: number | string, option: WidgetTypeOption[]): any {
    if (option) {
      const currentOption = option.find(o => o.value === value);
      if (currentOption) {
        return currentOption.name;
      }
    }
    return value;
  }
}

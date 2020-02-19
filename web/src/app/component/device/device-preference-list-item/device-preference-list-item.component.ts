import { Component, OnInit, Input } from '@angular/core';
import { WidgetType, WidgetParam } from 'src/app/interface/widget';
import { WidgetComponentType } from 'src/app/const/enums';
import { DeviceService } from 'src/app/service/device.service';

@Component({
  selector: 'app-device-preference-list-item',
  templateUrl: './device-preference-list-item.component.html',
  styleUrls: ['./device-preference-list-item.component.scss']
})
export class DevicePreferenceListItemComponent implements OnInit {
  @Input() param: WidgetParam;
  readonly widgetComponentType: typeof WidgetComponentType = WidgetComponentType;

  constructor(
    private deviceService: DeviceService
  ) { }

  ngOnInit() {
  }

  get widgettype(): WidgetType {
    return this.param.widgettype;
  }

  get isEdited(): boolean {
    return this.param.currentvalue !== this.param.editedvalue;
  }

  get isValidateError(): boolean {
    const value = this.param.editedvalue;
    const widgettype = this.widgettype;
    if (value === null || value === undefined) {
      return true;
    }

    if (widgettype.type === WidgetComponentType.Combobox) { // combobox.
      if (widgettype.option.findIndex(n => n.value === value) < 0) {
        return true;
      }
    } else { // textbox, slider.
      if (widgettype.min !== undefined
          && value < widgettype.min) {
        return true;
      }
      if (widgettype.max !== undefined
          && value > widgettype.max) {
        return true;
      }
    }

    return false;
  }

  get isParameterError(): boolean {
    const address = this.param.paramaddress;
    const i = this.deviceService.errorParameterAdresses.findIndex(n => n === address);
    return i >= 0;
  }

  get isDisabled(): boolean {
    return false;
  }

  get isDisabledDefault(): boolean {
    return this.isDisabled || this.param.widgettype.default === undefined;
  }

  default(): void {
    this.param.editedvalue = this.widgettype.default;
  }
}

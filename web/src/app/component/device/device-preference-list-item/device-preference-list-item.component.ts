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

  // Use slider.
  private slilderMin: number;
  private slilderMax: number;

  constructor(
    private deviceService: DeviceService
  ) { }

  ngOnInit() {
    // Initialize slider range.
    if (this.widgettype.type === WidgetComponentType.Slider) {
      const {min, max, resolution} = this.widgettype;
      const base = this.widgettype.default; // default is reserved word.

      // Calculate slider range from protrusion.
      const minProtrude = (base - min) % resolution;
      if (minProtrude > 0) {
        this.slilderMin = min - (resolution - minProtrude);
      } else {
        this.slilderMin = min;
      }
      const maxProtrude = (max - base) % resolution;
      if (maxProtrude > 0) {
        this.slilderMax = max + (resolution - maxProtrude);
      } else {
        this.slilderMax = max;
      }
    }
  }

  get sliderValue(): number {
    if (this.param.editedvalue === undefined) {
      return this.slilderMin;
    }
    if (this.param.editedvalue <= this.widgettype.min) {
      return this.slilderMin;
    }
    if (this.param.editedvalue >= this.widgettype.max) {
      return this.slilderMax;
    }
    return this.param.editedvalue;
  }

  set sliderValue(sliderValue: number) {
    this.param.editedvalue = this.toEditedValueFromSlider(sliderValue);
  }

  get widgettype(): WidgetType {
    return this.param.widgettype;
  }

  get isEdited(): boolean {
    return this.deviceService.isEditedParameter(this.param);
  }

  get isValidateError(): boolean {
    return this.deviceService.isValidateError(this.param);
  }

  get isParameterWarn(): boolean {
    if (this.param.currentvalue === undefined) {
      return true;
    }
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

  toEditedValueFromSlider(sliderValue: number): number {
    let editedvalue = sliderValue;
    if (this.widgettype.min !== undefined) {
      editedvalue = Math.max(this.widgettype.min, editedvalue);
    }
    if (this.widgettype.max !== undefined) {
      editedvalue = Math.min(this.widgettype.max, editedvalue);
    }
    return editedvalue;
  }
}

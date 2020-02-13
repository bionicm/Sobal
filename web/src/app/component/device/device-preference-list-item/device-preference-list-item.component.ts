import { Component, OnInit, Input } from '@angular/core';
import { WidgetType, WidgetParam } from 'src/app/interface/widget';
import { WidgetComponentType } from 'src/app/const/enums';

@Component({
  selector: 'app-device-preference-list-item',
  templateUrl: './device-preference-list-item.component.html',
  styleUrls: ['./device-preference-list-item.component.scss']
})
export class DevicePreferenceListItemComponent implements OnInit {
  @Input() param: WidgetParam;
  readonly widgetComponentType: typeof WidgetComponentType = WidgetComponentType;

  constructor() { }

  ngOnInit() {
  }

  get widgettype(): WidgetType {
    return this.param.widgettype;
  }

  get isDisabled(): boolean {
    if (this.param.currentvalue === undefined) {
      return true;
    }
    return false;
  }

  get isEdited(): boolean {
    return this.param.currentvalue !== this.param.editedvalue;
  }

  get isError(): boolean {
    // TODO
    return false;
  }

  get isDisabledDefault(): boolean {
    return this.isDisabled || this.param.widgettype.default === undefined;
  }

  default(): void {
    this.param.editedvalue = this.widgettype.default;
  }
}

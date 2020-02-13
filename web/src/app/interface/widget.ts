import { WidgetComponentType } from '../const/enums';

export interface Widget {
    ParamService: WidgetParamService;
    StatusService: WidgetStatusService;
    ModeService: WidgetModeService;
}

export interface WidgetParamService {
    readUuid: string;
    writeUuid: string;
    groups: Array<WidgetGroup>;
}

export interface WidgetStatusService {
    params: Array<WidgetCharacteristic>;
}

export interface WidgetModeService {
    targetUuid: string;
    params: Array<WidgetCharacteristic>;
}

export interface WidgetGroup {
    grouplabel: string;
    params: Array<WidgetParam>;
}

export interface WidgetParam {
    paramaddress: string;
    paramlabel: string;
    widgettype: WidgetType;

    // for edit.
    currentvalue: number;
    editedvalue: number;
}

export interface WidgetType {
    type: WidgetComponentType;
    default: number;
    min: number;
    max: number;
    step: number;
    option: Array<WidgetTypeOption>;
    decimalplaces: number;
    unit: string;
}

export interface WidgetTypeOption {
    name: string;
    value: number | string;
}

export interface WidgetCharacteristic {
    uuid: string;
    paramlabel: string;
    widgettype: WidgetType;
    // for view.
    currentvalue: number | string;
}

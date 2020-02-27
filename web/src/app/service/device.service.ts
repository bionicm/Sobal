import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, BehaviorSubject, from, zip, of, throwError, Subject } from 'rxjs';
import { startWith, flatMap, map, concatMap, tap, delay, repeat, finalize, catchError, timeout, takeUntil, take } from 'rxjs/operators';

import { Device } from '../interface/device';
import { ApiService } from './api.service';
import { Widget, WidgetParam, WidgetGroup } from '../interface/widget';
import { AppConst } from '../const/const';
import { Output } from '../interface/output';
import { ApplicationService } from './application.service';
import { ErrorService } from './error.service';
import { WidgetComponentType } from '../const/enums';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  // selected device.
  public device: Device = undefined;
  private deselect$ = new Subject();

  // widget.
  public widget: Widget;
  public ungroupParams: WidgetParam[];

  // Last time to get all parameters.
  private lastUpdated = new BehaviorSubject<Date>(undefined);
  public lastUpdated$ =  this.lastUpdated.asObservable();

  public errorParameterAdresses: string[] = [];

  constructor(
    private http: HttpClient,
    private app: ApplicationService,
    private apiService: ApiService,
    private errorService: ErrorService
  ) { }

  get devices$(): Observable<Device[]> {
    return interval(AppConst.deviceDiscoveryInterval)
      .pipe(
        startWith(0),
        flatMap(() => this.apiService.getDevices()),
        map(devices => {
          return this.sortDevices(devices);
        })
      );
  }

  selectDevice(device: Device): void {
    this.device = device;
  }

  deselectDevice(): void {
    this.device = null;
    this.deselect$.next();
  }

  loadWidget(): Observable<Widget> {
    const { type } = this.device;
    let path;
    if (type === AppConst.deviceNameTypeAnkle) {
      path = AppConst.widgetJsonPathTypeAnkle;
    } else if (type === AppConst.deviceNameTypeKnee) {
      path = AppConst.widgetJsonPathTypeKnee;
    } else {
      return throwError(new Error('Widget json load error.'));
    }
    return this.http.get<Widget>(path).pipe(
      map(data => {
        // Throw an Error if validation fails.
        this.validateWidget(data);
        return data;
      }),
      tap(data => {
        this.widget = data;
        this.ungroupParams = this.ungroup(data.ParamService.groups);
      })
    );
  }

  connect(pincode: string): Observable<boolean> {
    // TODO PIN code auth.
    if (pincode === '1111') {
      this.app.startLoading('connect');
      // TODO dummy api for connection.
      return this.mode$().pipe(
        take(1),
        map(data => true),
        finalize(() => this.app.stopLoading('connect'))
      );
    } else {
      return of(false);
    }
  }

  pollingLoadStatus$() {
    return this.mode$().pipe(
      concatMap(() => this.status$()),
      delay(AppConst.deviceStatusInterval),
      repeat(),
      takeUntil(this.deselect$)
    );
  }

  mode$() {
    const { address } = this.device;
    const mergeMode = data => {
      if (data[0] && data[1]) {
        data[0].currentvalue = data[1].value;
      }
    };
    return from(this.widget.ModeService.params).pipe(
      concatMap(modeParam => {
        // zip: [widgetMode, deviceMode]
        return zip(
          of(modeParam),
          this.apiService.getMode(address, modeParam.uuid)
        );
      }),
      tap(mergeMode)
    );
  }

  status$() {
    const { address } = this.device;
    const mergeStatus = data => {
      if (data[0] && data[1]) {
        data[0].currentvalue = data[1].value;
      }
    };
    return from(this.widget.StatusService.params).pipe(
      concatMap(widgetParam => {
        // zip: [widget, deviceStatus]
        return zip(
          of(widgetParam),
          this.apiService.getStatus(address, widgetParam.uuid)
        );
      }),
      tap(mergeStatus)
    );
  }

  loadAllWidgetParameters(): void {
    this.loadWidgetParameters(this.ungroupParams);
  }

  updateEditedParameters(): void {
    const { address } = this.device;
    const editedParams = this.filterEditedParameters();
    if (!address || editedParams.length === 0) {
      return;
    }

    this.app.startLoading('setMode');
    this.apiService.setMode(address, this.widget.ModeService.targetUuid, {
      value: AppConst.parameterUpdateMode
    }).pipe(
      timeout(AppConst.waitParameterUpdateMode),
      finalize(() => this.app.stopLoading('setMode'))
    ).subscribe(data => {
      const parameters = editedParams.map(p => {
        return {
          paramaddress: p.paramaddress,
          value: p.editedvalue
        };
      });
      this.app.startLoading('updateParameter');
      this.apiService.setParameters(
        address,
        this.widget.ParamService.writeUuid,
        parameters
      ).pipe(
        finalize(() => this.app.stopLoading('updateParameter'))
      ).subscribe(() => {
        this.loadWidgetParameters(editedParams);
      });
    }, error => {
      this.errorService.warning('ErrorMessage.parameterUpdateMode');
    });
  }

  mergeParams(params: Output): void {
    params.ParamService.params.forEach(param => {
      const widgetParam = this.ungroupParams.find(n => n.paramaddress === param.paramaddress);
      if (widgetParam) {
        if (param.value !== undefined) {
          let value = param.value;
          if (widgetParam.widgettype.min !== undefined) {
            value = Math.max(widgetParam.widgettype.min, value);
          }
          if (widgetParam.widgettype.max !== undefined) {
            value = Math.min(widgetParam.widgettype.max, value);
          }
          widgetParam.editedvalue = value;
        }
      }
    });
  }

  ////////////////////////////////////////
  // Validate method.
  ////////////////////////////////////////
  private validateWidget(widget: Widget): void {
    if (!widget || !widget.ParamService || !widget.ModeService || !widget.StatusService) {
      throw new Error('Widget json validate error. Required Service.');
    }
    for (const group of widget.ParamService.groups) {
      for (const param of group.params) {
        const widgettype = param.widgettype;
        if (widgettype.type === WidgetComponentType.Textbox) {
          // No required.
        } else if (widgettype.type === WidgetComponentType.Slider) {
          if (widgettype.min === undefined
             || widgettype.max === undefined
             || widgettype.default === undefined
             || widgettype.resolution === undefined) {
              throw new Error('Widget json validate error. Required property of Slider.');
          }
        } else if (widgettype.type === WidgetComponentType.Combobox) {
          if (!widgettype.option || widgettype.option.length === 0) {
            throw new Error('Widget json validate error. Required property of Combobox.');
          }
        } else {
          throw new Error('Widget json validate error. Unexpected type.');
        }
      }
    }
    // Validate check OK.
  }

  get hasValidateError(): boolean {
    if (!this.ungroupParams) {
      return false;
    }
    const i = this.ungroupParams.findIndex(n => this.isValidateError(n));
    return i >= 0;
  }

  get hasEditedParameter(): boolean {
    if (!this.ungroupParams) {
      return false;
    }
    const i = this.ungroupParams.findIndex(n => this.isEditedParameter(n));
    return i >= 0;
  }

  isValidateError(param: WidgetParam): boolean {
    const value = param.editedvalue;
    if (value === undefined) {
      // Before editing
      return false;
    }
    if (value === null) {
      return true;
    }
    const widgettype = param.widgettype;
    if (widgettype.type === WidgetComponentType.Combobox) { // combobox.
      if (widgettype.option.findIndex(n => n.value === value) < 0) {
        // Not found.
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

  isEditedParameter(param: WidgetParam): boolean {
    if (param.editedvalue === undefined) {
      // Before editing
      return false;
    }
    return param.currentvalue !== param.editedvalue;
  }

  ////////////////////////////////////////
  // Private method.
  ////////////////////////////////////////
  private sortDevices(devices: Device[]): Device[] {
    return devices.sort((d1, d2) => {
      return d2.rssi - d1.rssi;
    });
  }

  private ungroup(groups: WidgetGroup[]): WidgetParam[] {
    let params = [];
    groups.forEach(g => {
      if (g.params) {
        params = params.concat(g.params);
      }
    });
    return params;
  }

  private filterEditedParameters(): WidgetParam[] {
    return this.ungroupParams.filter(p => this.isEditedParameter(p));
  }

  private loadWidgetParameters(params: WidgetParam[]): void {
    if (!params || params.length === 0) {
      return;
    }

    const readFailureParameterAdresses = [];
    this.app.startLoading('loadParameter');
    from(params).pipe(
      concatMap(widgetParam => {
        return zip(of(widgetParam),
          this.apiService.getParameter(
            this.device.address,
            this.widget.ParamService.writeUuid,
            this.widget.ParamService.readUuid,
            widgetParam.paramaddress));
      }),
      finalize(() => {
        this.app.stopLoading('loadParameter');
      })
    ).subscribe(data => {
      if (data[0] && data[1] && data[0].paramaddress === data[1].paramaddress) {
        const deviceCurrentValue = data[1].value;

        // set widget current parameter.
        data[0].currentvalue = deviceCurrentValue;

        if (deviceCurrentValue !== undefined) {
          // set widget edit parameter.
          data[0].editedvalue = deviceCurrentValue;
        } else {
          // read failure.
          readFailureParameterAdresses.push(data[1].paramaddress);
        }
      }
    }, error => {
    }, () => {
      if (readFailureParameterAdresses.length > 0) {
        this.errorService.warning('ErrorMessage.readFailureParamAddress', {
          address: readFailureParameterAdresses.join(', ')
        });
      }
      this.errorCheck();
    });
  }

  private errorCheck(): void {
    const { address } = this.device;
    if (!address) {
      return;
    }

    this.app.startLoading('errorCheck');
    this.apiService.getErrorParameters(
      address,
      this.widget.ParamService.writeUuid,
      this.widget.ParamService.readUuid
    ).pipe(
      finalize(() => this.app.stopLoading('errorCheck'))
    ).subscribe(data => {
      this.errorParameterAdresses = data.addresses;
      if (data.addresses.length > 0) {
        this.errorService.warning('ErrorMessage.errorParamAddress', {address: data.addresses.join(', ')});
      }
      this.lastUpdated.next(new Date());
    });
  }
}

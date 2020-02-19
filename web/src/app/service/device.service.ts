import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, BehaviorSubject, from, zip, of, throwError } from 'rxjs';
import { startWith, flatMap, map, concatMap, tap, delay, repeat, finalize, catchError } from 'rxjs/operators';

import { Device } from '../interface/device';
import { ApiService } from './api.service';
import { Widget, WidgetParam, WidgetGroup } from '../interface/widget';
import { AppConst } from '../const/const';
import { Output } from '../interface/output';
import { ApplicationService } from './application.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  // selected device.
  public device: Device = undefined;

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

  setDevice(device: Device): void {
    this.device = device;
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
      tap(data => {
        this.widget = data;
        this.ungroupParams = this.ungroup(data.ParamService.groups);
      })
    );
  }

  pollingLoadStatus$() {
    return this.mode$().pipe(
      concatMap(() => this.status$()),
      delay(AppConst.deviceStatusInterval),
      repeat()
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
    if (editedParams.length === 0) {
      return;
    }

    this.app.startLoading('setMode');
    this.apiService.setMode(address, this.widget.ModeService.targetUuid, {
      value: AppConst.parameterUpdateMode
    }).pipe(
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
      this.errorService.warning('Error.parameterUpdateMode');
    });
  }

  mergeParams(params: Output): void {
    params.ParamService.params.forEach(param => {
      const widgetParam = this.ungroupParams.find(n => n.paramaddress === param.paramaddress);
      if (widgetParam) {
        widgetParam.editedvalue = param.value;
      }
    });
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
      params = params.concat(g.params);
    });
    return params;
  }

  private filterEditedParameters(): WidgetParam[] {
    return this.ungroupParams.filter(p => {
      return p.editedvalue !== undefined
        && p.editedvalue !== null
        && p.currentvalue !== p.editedvalue;
    });
  }

  private loadWidgetParameters(params: WidgetParam[]): void {
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
        data[0].currentvalue = data[1].value;
        data[0].editedvalue = data[1].value;
      }
    }, error => {
    }, () => {
      this.errorCheck();
    });
  }

  private errorCheck(): void {
    this.app.startLoading('errorCheck');

    this.apiService.getErrorParameters(
      this.device.address,
      this.widget.ParamService.writeUuid,
      this.widget.ParamService.readUuid
    ).pipe(
      finalize(() => this.app.stopLoading('errorCheck'))
    ).subscribe(data => {
      this.errorParameterAdresses = data.addresses;
      if (data.addresses.length > 0) {
        this.errorService.warning('Error.paramAddress', {address: data.addresses});
      }
      this.lastUpdated.next(new Date());
    });
  }
}

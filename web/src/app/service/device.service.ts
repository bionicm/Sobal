import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, BehaviorSubject, from, zip, of, throwError } from 'rxjs';
import { startWith, flatMap, map, concatMap, tap } from 'rxjs/operators';

import { Device } from '../interface/device';
import { ApiService } from './api.service';
import { Widget, WidgetParam, WidgetGroup } from '../interface/widget';
import { AppConst } from '../const/const';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  // selected device.
  public device: Device = undefined;

  // widget.
  public widget: Widget;
  private ungroupParams: WidgetParam[];

  // Last time to get all parameters.
  private lastUpdated = new BehaviorSubject<Date>(undefined);
  public lastUpdated$ =  this.lastUpdated.asObservable();

  constructor(
    private http: HttpClient,
    private apiService: ApiService
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

  statuses(): void {
    const { address } = this.device;

    // TODO
    this.widget.ModeService.params[0].currentvalue = "0x0100";

    // TODO Polling
    from(this.widget.StatusService.params).pipe(
      concatMap(widgetParam => {
        return zip(of(widgetParam), this.apiService.getStatus(address, widgetParam.uuid));
      })
    ).subscribe(param => {
      console.log('PARAM: ', param);
      if (param[0] && param[1]) {
        param[0].currentvalue = param[1].value;
      }
    }, error => {
      console.log('error');
    });
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

  loadAllWidgetParameters() {
    this.loadWidgetParameters(this.ungroupParams);
  }

  updateEditedParameters(): void {
    const { address } = this.device;
    const editedParams = this.filterEditedParams();
    if (editedParams.length === 0) {
      return;
    }

    this.apiService.setMode(address, this.widget.ModeService.targetUuid, {
      value: AppConst.parameterUpdateMode
    }).subscribe(data => {
      const parameters = editedParams.map(p => {
        return {
          paramaddress: p.paramaddress,
          value: p.editedvalue
        };
      });
      this.apiService.setParameters(
        address,
        this.widget.ParamService.writeUuid,
        parameters)
      .subscribe(() => {
        this.loadWidgetParameters(editedParams);
      });
    }, error => {
      // TODO: 
      console.log('Update Mode error');
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

  private filterEditedParams(): WidgetParam[] {
    return this.ungroupParams.filter(p => {
      return p.currentvalue !== p.editedvalue;
    });
  }

  private loadWidgetParameters(params: WidgetParam[]): void {
    from(params).pipe(
      concatMap(widgetParam => {
        return zip(of(widgetParam),
          this.apiService.getParameter(
            this.device.address,
            this.widget.ParamService.writeUuid,
            this.widget.ParamService.readUuid,
            widgetParam.paramaddress)
        )
      })
    ).subscribe(data => {
      if (data[0] && data[1]) {
        if (data[0].paramaddress === data[1].paramaddress) {
          data[0].currentvalue = data[1].value;
          data[0].editedvalue = data[1].value;
        }
      } else {
        console.log('get parameter error', data[0].paramaddress);
      }
    }, error => {
      console.log('error');
    }, () => {
      this.lastUpdated.next(new Date());
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Device } from '../interface/device';
import { Observable } from 'rxjs';
import { Parameter } from '../interface/parameter';
import { AppConst } from '../const/const';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url = environment.apiUrl;
  readonly getDevicesUrl = this.url + '/v1/devices/list';
  readonly getParameterUrl = this.url + '/v1/devices/{deviceAddress}/params/{paramAddress}';
  readonly setParametersUrl = this.url + '/v1/devices/{deviceAddress}/params';
  readonly getStatusUrl = this.url + '/v1/devices/{deviceAddress}/statuses';
  readonly setModeUrl = this.url + '/v1/devices/{deviceAddress}/modes';
  readonly getModeUrl = this.url + '/v1/devices/{deviceAddress}/modes';

  constructor(
    private http: HttpClient
  ) {
  }

  getDevices(): Observable<Array<Device>> {
    console.log('[api] getDevices');
    const httpOptions = {
      params: new HttpParams({
        fromObject: {
          types: [AppConst.deviceNameTypeAnkle,
                  AppConst.deviceNameTypeKnee]
        }
      })
    };
    return this.http.get<Array<Device>>(this.getDevicesUrl, httpOptions);
  }

  getParameter(deviceAddress: string, writeUuid: string, readUuid: string, paramAddress: string): Observable<Parameter> {
    console.log('[api] getParameter', paramAddress);
    const url = this.getParameterUrl
      .replace('{deviceAddress}', deviceAddress)
      .replace('{paramAddress}', paramAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid,
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<Parameter>(url, httpOptions);
  }

  setParameters(deviceAddress: string, writeUuid: string, params: Parameter[]) {
    console.log('[api] setParameters', params);
    const url = this.setParametersUrl.replace('{deviceAddress}', deviceAddress);
    const body = JSON.stringify(params);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getStatus(deviceAddress: string, readUuid: string) {
    console.log('[api] getStatus');
    const url = this.getStatusUrl.replace('{deviceAddress}', deviceAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<{value: number, uuid: string}>(url, httpOptions);
  }

  setMode(deviceAddress: string, writeUuid: string, param: {value: string}) {
    console.log('[api] setMode');
    const url = this.setModeUrl.replace('{deviceAddress}', deviceAddress);
    const body = JSON.stringify(param);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid
      })
    };
    console.log(body)
    return this.http.post(url, body, httpOptions);
  }

  getMode(deviceAddress: string, readUuid: string) {
    console.log('[api] getMode');
    const url = this.getModeUrl.replace('{deviceAddress}', deviceAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<{uuid: string, value: string}>(url, httpOptions);
  }
}

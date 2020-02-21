import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Device } from '../interface/device';
import { Observable, of, throwError } from 'rxjs';
import { Parameter } from '../interface/parameter';
import { AppConst } from '../const/const';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url = environment.apiUrl;
  private readonly getDevicesUrl = this.url + '/v1/devices/list';
  private readonly getParameterUrl = this.url + '/v1/devices/{deviceAddress}/params/{paramAddress}';
  private readonly setParametersUrl = this.url + '/v1/devices/{deviceAddress}/params';
  private readonly getStatusUrl = this.url + '/v1/devices/{deviceAddress}/statuses';
  private readonly setModeUrl = this.url + '/v1/devices/{deviceAddress}/modes';
  private readonly getModeUrl = this.url + '/v1/devices/{deviceAddress}/modes';
  private readonly getErrorParametersUrl = this.url + '/v1/devices/{deviceAddress}/errorparams';

  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) {
  }

  getDevices(): Observable<Array<Device>> {
    const httpOptions = {
      params: new HttpParams({
        fromObject: {
          // conditions to filter.
          types: [AppConst.deviceNameTypeAnkle,
                  AppConst.deviceNameTypeKnee]
        }
      })
    };
    return this.http.get<Array<Device>>(this.getDevicesUrl, httpOptions).pipe(
      catchError(this.errorHandler([]))
    );
  }

  getParameter(deviceAddress: string, writeUuid: string, readUuid: string, paramAddress: string): Observable<Parameter> {
    const url = this.getParameterUrl
      .replace('{deviceAddress}', deviceAddress)
      .replace('{paramAddress}', paramAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid,
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<Parameter>(url, httpOptions).pipe(
      catchError(this.errorHandler({
        paramaddress: paramAddress,
        value: undefined
      }))
    );
  }

  setParameters(deviceAddress: string, writeUuid: string, params: Parameter[]) {
    const url = this.setParametersUrl.replace('{deviceAddress}', deviceAddress);
    const body = JSON.stringify(params);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid
      })
    };
    return this.http.post(url, body, httpOptions).pipe(
      catchError(this.errorHandler())
    );
  }

  getStatus(deviceAddress: string, readUuid: string): Observable<{uuid: string, value: number}> {
    const url = this.getStatusUrl.replace('{deviceAddress}', deviceAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<{uuid: string, value: number}>(url, httpOptions).pipe(
      catchError(this.errorHandler({uuid: readUuid, value: undefined}))
    );
  }

  setMode(deviceAddress: string, writeUuid: string, param: {value: string}) {
    const url = this.setModeUrl.replace('{deviceAddress}', deviceAddress);
    const body = JSON.stringify(param);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid
      })
    };
    return this.http.post(url, body, httpOptions).pipe(
      catchError(this.errorHandler())
    );
  }

  getMode(deviceAddress: string, readUuid: string): Observable<{uuid: string, value: string}> {
    const url = this.getModeUrl.replace('{deviceAddress}', deviceAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<{uuid: string, value: string}>(url, httpOptions).pipe(
      catchError(this.errorHandler({uuid: readUuid, value: undefined}))
    );
  }

  getErrorParameters(deviceAddress: string, writeUuid: string, readUuid: string): Observable<{addresses: string[]}> {
    const url = this.getErrorParametersUrl.replace('{deviceAddress}', deviceAddress);
    const httpOptions = {
      headers: new HttpHeaders({
        'Write-Uuid': writeUuid,
        'Read-Uuid': readUuid
      })
    };
    return this.http.get<{addresses: string[]}>(url, httpOptions).pipe(
      catchError(this.errorHandler({addresses: []}))
    );
  }

  private errorHandler<T>(result?: T) {
    return (error) => {
      const errorCode = error.error.error_code || '';
      if (this.isReturnResult(error.status, errorCode)) {
        return of(result as T);
      }

      const message = this.globalError(error.status, errorCode);
      if (message) {
        this.errorService.error(message);
      }

      return throwError(error);
    };
  }

  private isReturnResult(status: number, code: string) {
    const errorDetail = code.slice(-2).toLowerCase();
    if (status === 404) {
      // Read failed.
      if (errorDetail === '08'
      || errorDetail === '09'
      || errorDetail === '0a') {
        return true;
      }
    }
    return false;
  }

  private globalError(status: number, code: string) {
    switch (status) {
      case 0:
          return 'ErrorMessage.server';
      case 400:
          return 'ErrorMessage.badRequest';
      case 401:
          return 'ErrorMessage.unauthorized';
      case 404:
          // No error_code in the invalid url.
          if (!code) {
              return 'ErrorMessage.notFound';
          }
          break;
      case 405:
          return 'ErrorMessage.methodNotAllowed';
      case 500:
          return 'ErrorMessage.internalServerError';
      case 504:
          return 'ErrorMessage.gatewayTimeout';
      default:
          break;
    }
    return undefined;
  }
}

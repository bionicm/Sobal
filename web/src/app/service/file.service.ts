import { Injectable } from '@angular/core';
import { AppConst } from '../const/const';
import { Output } from '../interface/output';
import { DeviceService } from './device.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private deviceService: DeviceService,
    private errorService: ErrorService
  ) { }

  /**
   * import output.json
   */
  import(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      if (input.files.length === 1) {
        const file = input.files[0];
        this.fileRead(file);
      }
    };
    input.click();
  }

  /**
   * export output.json
   */
  export(): void {
    const deviceType = this.deviceService.device.type;
    let filename;
    if (deviceType === AppConst.deviceNameTypeAnkle) {
      filename = AppConst.outputJsonNameTypeAnkle;
    } else if (deviceType === AppConst.deviceNameTypeKnee) {
      filename = AppConst.outputJsonNameTypeKnee;
    } else {
      this.errorService.warning('ErrorMessage.saveExportFile');
      return;
    }
    try {
      const ungroupParams = this.deviceService.ungroupParams;
      const outputParams = ungroupParams.map(param => {
        return {
          paramaddress: param.paramaddress,
          paramlabel: param.paramlabel,
          value: param.editedvalue
        };
      });
      const json = {
        ParamService: {
          params: outputParams
        }
      };
      const blob = new Blob([JSON.stringify(json, null, '  ')]);
      this.download(blob, filename);
    } catch (e) {
      this.errorService.warning('ErrorMessage.saveExportFile');
    }
  }

  private download(blob: Blob, filename: string) {
    const a = document.createElement('a');
    a.download = decodeURI(filename);
    a.href = URL.createObjectURL(blob);
    a.click();
  }

  private fileRead(file: File) {
    const reader = new FileReader();
    reader.onerror = (err) => {
      this.errorService.warning('ErrorMessage.loadImportFile');
    };
    reader.onload = (event) => {
      const result = reader.result;
      if (result) {
        try {
          const output: Output = JSON.parse(result.toString());
          if (output && output.ParamService && output.ParamService.params) {
            this.deviceService.mergeParams(output);
          } else {
            this.errorService.warning('ErrorMessage.loadImportFile');
          }
        } catch (e) {
          this.errorService.warning('ErrorMessage.loadImportFile');
        }
      } else {
        this.errorService.warning('ErrorMessage.loadImportFile');
      }
    };
    reader.readAsText(file);
  }
}

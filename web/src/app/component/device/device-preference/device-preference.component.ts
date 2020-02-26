import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Widget } from 'src/app/interface/widget';
import { DeviceService } from 'src/app/service/device.service';
import { FileService } from 'src/app/service/file.service';
import { ApplicationService } from 'src/app/service/application.service';

@Component({
  selector: 'app-device-preference',
  templateUrl: './device-preference.component.html',
  styleUrls: ['./device-preference.component.scss']
})
export class DevicePreferenceComponent implements OnInit, OnDestroy {
  widget: Widget;
  lastUpdated$ = this.deviceService.lastUpdated$;

  constructor(
    private router: Router,
    private app: ApplicationService,
    private deviceService: DeviceService,
    private fileService: FileService
  ) {
  }

  ngOnInit() {
    this.app.setTitle('DevicePreference.title');
    if (!this.deviceService.device) {
      this.deselectDevice();
      return;
    }

    this.widget = this.deviceService.widget;
    this.deviceService.pollingLoadStatus$().subscribe();
    this.reload();
  }

  ngOnDestroy() {
  }

  get isDisabledUpdate(): boolean {
    return !this.deviceService.hasEditedParameter || this.deviceService.hasValidateError;
  }

  reload(): void {
    this.deviceService.loadAllWidgetParameters();
  }

  update(): void {
    this.deviceService.updateEditedParameters();
  }

  import(): void {
    this.fileService.import();
  }

  export(): void {
    this.fileService.export();
  }

  deselectDevice(): void {
    this.deviceService.deselectDevice();
    this.router.navigate(['/']);
  }
}

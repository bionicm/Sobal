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

  private statusSubscription: Subscription;

  constructor(
    private router: Router,
    private app: ApplicationService,
    private deviceService: DeviceService,
    private fileService: FileService
  ) {
  }

  ngOnInit() {
    this.app.setTitle('DevicePreference.title');
    // TODO.
    if (!this.deviceService.device) {
      this.router.navigate(['/']);
    }
    this.widget = this.deviceService.widget;
    this.statusSubscription = this.deviceService.pollingLoadStatus$().subscribe();
    this.reload();
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
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
    this.deviceService.setDevice(null);
    this.router.navigate(['/']);
  }
}

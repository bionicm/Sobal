import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Widget } from 'src/app/interface/widget';
import { DeviceService } from 'src/app/service/device.service';


@Component({
  selector: 'app-device-preference',
  templateUrl: './device-preference.component.html',
  styleUrls: ['./device-preference.component.scss']
})
export class DevicePreferenceComponent implements OnInit {
  widget: Widget;
  lastUpdated$ = this.deviceService.lastUpdated$;

  constructor(
    private router: Router,
    private deviceService: DeviceService
  ) {
  }

  ngOnInit() {
    // TODO.
    if (!this.deviceService.device) {
      this.router.navigate(['/']);
    }
    this.widget = this.deviceService.widget;
    this.deviceService.statuses();
    this.reload();
  }

  reload(): void {
    this.deviceService.loadAllWidgetParameters();
  }

  update(): void {
    this.deviceService.updateEditedParameters();
  }

  import(): void {
    console.log('import');
  }

  export(): void {
    console.log('export');
  }
}

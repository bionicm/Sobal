import { Component, OnInit } from '@angular/core';

import { DeviceService } from 'src/app/service/device.service';
import { Widget } from 'src/app/interface/widget';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {

  deviceName: string;
  widget: Widget = this.deviceService.widget;

  constructor(
    private deviceService: DeviceService
  ) { }

  ngOnInit() {
    if (this.deviceService.device) {
      this.deviceName = this.deviceService.device.name;
    }
  }
}

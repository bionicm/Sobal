import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Device } from 'src/app/interface/device';

@Component({
  selector: 'app-device-list-item',
  templateUrl: './device-list-item.component.html',
  styleUrls: ['./device-list-item.component.scss']
})
export class DeviceListItemComponent implements OnInit {
  @Input() device: Device;
  @Output() selected: EventEmitter<Device> = new EventEmitter<Device>();

  constructor() { }

  ngOnInit() {
  }

  onClicked() {
    this.selected.emit(this.device);
  }
}

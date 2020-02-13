import { Component, OnInit, Input } from '@angular/core';
import { WidgetGroup } from 'src/app/interface/widget';

@Component({
  selector: 'app-device-preference-list',
  templateUrl: './device-preference-list.component.html',
  styleUrls: ['./device-preference-list.component.scss']
})
export class DevicePreferenceListComponent implements OnInit {
  @Input() groups: WidgetGroup[];

  constructor() { }

  ngOnInit() {
  }
}

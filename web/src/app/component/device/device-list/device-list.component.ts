import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

import { DeviceService } from 'src/app/service/device.service';
import { Device } from 'src/app/interface/device';
import { PinDialogComponent } from '../pin-dialog/pin-dialog.component';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})
export class DeviceListComponent implements OnInit, OnDestroy {
  devices$: Observable<Device[]>;

  constructor(
    private router: Router,
    private deviceService: DeviceService,
    public dialog: MatDialog
  ) {
    this.devices$ = this.deviceService.devices$;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onSelected(device) {
    this.deviceService.setDevice(device);
    this.deviceService.loadWidget().subscribe(() => {
      // Open PinCode Daialog.
      const dialogRef = this.dialog.open(PinDialogComponent, {});
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.router.navigate(['/device']);
        }
      });
    }, error => {
      console.log(error);
    });
  }
}

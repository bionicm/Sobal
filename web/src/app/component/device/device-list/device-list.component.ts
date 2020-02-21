import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable, throwError } from 'rxjs';

import { DeviceService } from 'src/app/service/device.service';
import { Device } from 'src/app/interface/device';
import { PinDialogComponent } from '../pin-dialog/pin-dialog.component';
import { ErrorService } from 'src/app/service/error.service';
import { ApplicationService } from 'src/app/service/application.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})
export class DeviceListComponent implements OnInit, OnDestroy {
  devices$: Observable<Device[]>;

  constructor(
    private router: Router,
    private app: ApplicationService,
    private deviceService: DeviceService,
    public dialog: MatDialog,
    private errorService: ErrorService
  ) {
    this.devices$ = this.deviceService.devices$;
  }

  ngOnInit() {
    this.app.setTitle('DeviceList.title');
  }

  ngOnDestroy() {
  }

  onSelected(device) {
    this.deviceService.selectDevice(device);
    this.deviceService.loadWidget().pipe(
      catchError(err => {
        this.errorService.error('ErrorMessage.loadWidgetJson');
        return throwError(err);
      })
    ).subscribe(() => {
      // Open PIN code Daialog.
      const dialogRef = this.dialog.open(PinDialogComponent, {});
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // PIN code authentication successful.
          this.router.navigate(['/device']);
        }
      });
    });
  }
}

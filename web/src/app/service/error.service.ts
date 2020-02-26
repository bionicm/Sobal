import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { ErrorDialogComponent } from '../component/shared/error-dialog/error-dialog.component';

export const errorPriority = 20;
export const warningPriority = 10;

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private router: Router,
    public dialog: MatDialog
  ) { }

  error(msg: string, msgParams?: any): void {
    const highPriority = this.findHighPriorityDialog(errorPriority);
    if (highPriority) {
      // Error dialog is already displayed.
      return;
    } else {
      this.dialog.closeAll();
    }

    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        message: msg,
        messageParameters: msgParams,
        okLabel: 'OK',
        priority: errorPriority
      },
      disableClose : true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/']);
      }
    });
  }

  warning(msg: string, msgParams?: any): void {
    const highPriority = this.findHighPriorityDialog(errorPriority);
    if (highPriority) {
      // Error dialog already displayed.
      return;
    }

    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      data: {
        message: msg,
        messageParameters: msgParams,
        cancelLabel: 'Close',
        priority: warningPriority
      },
      disableClose : true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  private findHighPriorityDialog(priority: number) {
    const highPriority = this.dialog.openDialogs.find(n => {
      let p = 0;
      if (n.componentInstance instanceof ErrorDialogComponent) {
        p = n.componentInstance.data.priority;
      }
      return p >= priority;
    });
    return highPriority;
  }
}

import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';
import { Subject, AsyncSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {

  private title = new Subject();
  public title$ = this.title.asObservable();

  // for loading.
  private loadingKeys: Set<string> = new Set();
  overlayRef = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay
      .position().global().centerHorizontally().centerVertically()
  });

  constructor(
    private overlay: Overlay
  ) { }

  setTitle(title: string): void {
    this.title.next(title);
  }

  startLoading(key: string): void {
    this.loadingKeys.add(key);
    // console.log(key, this.loadingKeys.size);

    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new ComponentPortal(MatSpinner));
    }
  }

  stopLoading(key: string): void {
    this.loadingKeys.delete(key);
    // console.log(key, this.loadingKeys.size);

    if (this.loadingKeys.size === 0
        && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}

import { Injectable, NgZone } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarRef,
  MatSnackBarHorizontalPosition,
  MatSnackBarConfig
} from '@angular/material/snack-bar';
import { AppSnackBarInnerComponent } from '../components/app-snack-bar-inner/app-snack-bar-inner.component';
import { ConstantsService } from './constants.service';
import { ISnackbarData } from '../models/snackbar.model';
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  public q = [];
  constructor(private _matSnackbar: MatSnackBar, private zone: NgZone) {}

  // The non buffered version cancels(hides) the previous message regardless of the duration
  // show(data) {
  //   ref(data);
  // }

  // Queue the messages and show them sequentially until duration time of each one lapses.
  // The message is shown when it is at 0 position in the q[], only.
  // The two cases are when:
  // client calls with a new message - just pushes the new message to the q
  // or self invoked on dismissing the previous one and there are more messages.
  show(data: ISnackbarData) {
    if (this.q[0] !== data) {
      this.q.push(data);
      console.log('push', data.message)
    }
    if (this.q[0] === data) {
      this.zone.run(() => {
        const snackbarRef = this.ref(data);
        snackbarRef.afterDismissed().subscribe(() => {
          this.q.shift();
          if (this.q.length > 0) {
            this.show(this.q[0]);
          }
        });
      });
    }
  }

  ref(data: ISnackbarData): MatSnackBarRef<AppSnackBarInnerComponent> {
    const options: MatSnackBarConfig = {
      data,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: data.class,
      duration: data.delay || ConstantsService.snackbarDuration * (data.class === 'snackbar__error' ? 2 : 1)
    };
    return this._matSnackbar.openFromComponent(AppSnackBarInnerComponent, options);
  }
}

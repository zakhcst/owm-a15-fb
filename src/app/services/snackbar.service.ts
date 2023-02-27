import { Injectable, NgZone } from '@angular/core';
import {
  MatLegacySnackBar as MatSnackBar,
  MatLegacySnackBarRef as MatSnackBarRef,
  MatLegacySnackBarHorizontalPosition as MatSnackBarHorizontalPosition,
  MatLegacySnackBarConfig as MatSnackBarConfig,
} from '@angular/material/legacy-snack-bar';
import { AppSnackBarInnerComponent } from '../components/app-snack-bar-inner/app-snack-bar-inner.component';
import { ConstantsService } from './constants.service';
import { IPopupModel, PopupType } from '../models/snackbar.model';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AppPopupMessages, AppStatusState } from '../states/app.state';
import { filter } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  @Select(AppPopupMessages.selectPopupMessages) popupMessage$: Observable<IPopupModel>;
  public q = [];

  constructor(private _matSnackbar: MatSnackBar, private zone: NgZone, private _store: Store) {
    this.subscribeToMessages();
  }

  subscribeToMessages() {
    this.popupMessage$.pipe(
      filter((data) => 
        !!data && this._store.selectSnapshot(AppStatusState.popupType) === PopupType.SNACKBAR 
      )
    ).subscribe((data: IPopupModel) => {
      this.show(data);
    });
  }
  

  // The non buffered version cancels(hides) the previous message regardless of the duration
  // show(data) {
  //   ref(data);
  // }

  // Queue the messages and show them sequentially until duration time of each one lapses.
  // The message is shown when it is at 0 position in the q[], only.
  // The two cases are when:
  // client calls with a new message - just pushes the new message to the q
  // or self invoked on dismissing the previous one and there are more messages.
  show(data: IPopupModel) {
    if (this.q[0] !== data) {
      this.q.push(data);
    }
    if (this.q[0] === data) {
      this.zone.run(() => {
        const snackbarRef = this.ref(data);
        const afterDismissedSubscription: Subscription = snackbarRef.afterDismissed().subscribe((_) => {
          afterDismissedSubscription.unsubscribe();
          this.q.shift();
          if (this.q.length > 0) {
            this.show(this.q[0]);
          }
        });
      });
    }
  }

  ref(data: IPopupModel): MatSnackBarRef<AppSnackBarInnerComponent> {
    const options: MatSnackBarConfig = {
      data,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: data.class,
      duration: data.delay || ConstantsService.snackbarDuration * (data.class === 'popup__error' ? 2 : 1),
    };
    return this._matSnackbar.openFromComponent(AppSnackBarInnerComponent, options);
  }
}

import { Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription, timer } from 'rxjs';
import { IPopupModel, PopupType } from '../../models/snackbar.model';
import { AppPopupMessages, AppStatusState } from '../../states/app.state';
import { ConstantsService } from '../../services/constants.service';
import { filter } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-toast-overlay',
  templateUrl: './toast-overlay.component.html',
  styleUrls: ['./toast-overlay.component.css'],
  animations: [
    trigger('popup', [
      state('in', style({ transform: 'translateY(0)' })),
      transition('void => *', [style({ transform: 'translateY(200%)' }), animate(100)]),
      transition('* => void', [animate(100, style({ transform: 'translateX(100%)' }))]),
    ]),
  ],
})
export class ToastOverlayComponent implements OnInit, OnDestroy {
  @Input('connectedToElement') connectedToElement: ElementRef;

  @Select(AppPopupMessages.selectPopupMessages) popupMessage$: Observable<IPopupModel>;
  isOpen = true;
  items = [];
  subscriptions: Subscription;

  connectedPosition = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'bottom',
      panelClass: 'overlay-position',
    },
  ];

  constructor(private _store: Store) {}

  ngOnInit(): void {
    this.subscribeToMessages();
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  subscribeToMessages() {
    this.subscriptions = this.popupMessage$
      .pipe(
        filter((data) => !!data && this._store.selectSnapshot(AppStatusState.popupType) === PopupType.TOAST))
      .subscribe((data: IPopupModel) => {
        this.items.push({ ...data, textColor: ConstantsService.messageTypeColor[data.class] });
        this.isOpen = true;
        this.triggerShift(data);
      });
  }

  triggerShift(data: IPopupModel) {
    timer((data.delay || 0) + ConstantsService.popupDelay_ms).subscribe(() => {
      this.items.shift();
      if (this.items.length === 0) {
        this.isOpen = false;
      }
    });
  }
}

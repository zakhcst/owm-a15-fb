import { Component, OnInit, Inject, HostListener, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetStatusTimeSlotBgPicture, SetStatusThreeDayForecast } from 'src/app/states/app.actions';
import { Store } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';

@Component({
  selector: 'app-dialog-settings',
  templateUrl: './dialog-settings.component.html',
  styleUrls: ['./dialog-settings.component.css'],
})
export class DialogSettingsComponent implements OnInit {
  timeSlotBgPicture = this._store.selectSnapshot(AppStatusState.timeSlotBgPicture);
  threeDayForecast = this._store.selectSnapshot(AppStatusState.threeDayForecast);

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.reposition();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogSettingsComponent>,
    private _store: Store,
  ) {}

  ngOnInit(): void {
    this.reposition();
  }

  toggleThreeDayForecast() {
    this.threeDayForecast = !this.threeDayForecast;
    this._store.dispatch(new SetStatusThreeDayForecast(this.threeDayForecast));
  }

  toggleTimeSlotBgPicture() {
    this.timeSlotBgPicture = !this.timeSlotBgPicture;
    this._store.dispatch(new SetStatusTimeSlotBgPicture(this.timeSlotBgPicture));
  }

  isXs() {
    return this.data.mediaObserver.isActive('xs500w');
  }

  reposition() {
    const settingsButtonLeft = this.data.settingsButton._elementRef.nativeElement.offsetLeft || document.body.clientWidth;
    const settingsButtonTop = this.data.settingsButton._elementRef.nativeElement.offsetTop;
    if (!settingsButtonTop) {
      this.closeDialog();
    }
    const settingsButtonHeight = this.data.settingsButton._elementRef.nativeElement.clientHeight;
    const settingsButtonoffsetWidth = this.data.settingsButton._elementRef.nativeElement.offsetWidth;
    const dialogPositionTop = settingsButtonTop + settingsButtonHeight;
    const dialogPositionLeft = settingsButtonLeft + (this.isXs() ? settingsButtonoffsetWidth : - this.data.dialogWidth);
    this.dialogRef.updatePosition({
      top: dialogPositionTop + 'px',
      left: dialogPositionLeft + 'px',
    });
  }
  closeDialog() {
    this.dialogRef.close();
  }
}

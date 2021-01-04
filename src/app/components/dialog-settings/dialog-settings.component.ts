import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetStatusTimeSlotBgPicture, SetStatusLiveDataUpdate, SetStatusDaysForecast, SetStatusShowDetailHumidity, SetStatusShowDetailWind, SetStatusShowDetailPressure } from 'src/app/states/app.actions';
import { Store, Select } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { buildInfo } from '../../../build-info';

@Component({
  selector: 'app-dialog-settings',
  templateUrl: './dialog-settings.component.html',
  styleUrls: ['./dialog-settings.component.css'],
})
export class DialogSettingsComponent implements OnInit {
  buildName = environment.name;
  buildTime = buildInfo.timeStamp;
  buildHash = buildInfo.hash;
  buildVersion = buildInfo.version;
  timeSlotBgPicture: boolean;
  liveDataUpdate: boolean;
  daysForecast: number;
  daysForecastOld: number;
  showDetailPressure: boolean;
  showDetailWind: boolean;
  showDetailHumidity: boolean;
  @Select(AppStatusState.updatesAvailable) updatesAvailable$: Observable<boolean>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.reposition();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogSettingsComponent>,
    private _store: Store
  ) {}

  ngOnInit(): void {
    this.timeSlotBgPicture = this._store.selectSnapshot(AppStatusState.timeSlotBgPicture);
    this.liveDataUpdate = this._store.selectSnapshot(AppStatusState.liveDataUpdate);
    this.daysForecast = this._store.selectSnapshot(AppStatusState.daysForecast);
    this.showDetailPressure = this._store.selectSnapshot(AppStatusState.showDetailPressure);
    this.showDetailWind = this._store.selectSnapshot(AppStatusState.showDetailWind);
    this.showDetailHumidity = this._store.selectSnapshot(AppStatusState.showDetailHumidity);

    this.daysForecastOld = this.daysForecast;
    this.reposition();
  }

  updateDaysForecast() {
    if (this.daysForecastOld === this.daysForecast) return;
    this.daysForecastOld = this.daysForecast;
    this._store.dispatch(new SetStatusDaysForecast(this.daysForecast));
  }

  toggleTimeSlotBgPicture() {
    this.timeSlotBgPicture = !this.timeSlotBgPicture;
    this._store.dispatch(new SetStatusTimeSlotBgPicture(this.timeSlotBgPicture));
  }

  toggleLiveDataUpdate() {
    this.liveDataUpdate = !this.liveDataUpdate;
    this._store.dispatch(new SetStatusLiveDataUpdate(this.liveDataUpdate));
  }

  toggleShowPressure() {
    this.showDetailPressure = !this.showDetailPressure;
    this._store.dispatch(new SetStatusShowDetailPressure(this.showDetailPressure));
  }
  toggleShowWind() {
    this.showDetailWind = !this.showDetailWind;
    this._store.dispatch(new SetStatusShowDetailWind(this.showDetailWind));
  }
  toggleShowHumidity() {
    this.showDetailHumidity = !this.showDetailHumidity;
    this._store.dispatch(new SetStatusShowDetailHumidity(this.showDetailHumidity));
  }

  isXs() {
    return this.data.mediaObserver.isActive('xs500w');
  }

  reposition() {
    const settingsButtonLeft =
      this.data.settingsButton._elementRef.nativeElement.offsetLeft || document.body.clientWidth;
    const settingsButtonTop = this.data.settingsButton._elementRef.nativeElement.offsetTop;
    if (!settingsButtonTop) {
      this.closeDialog();
    }
    const settingsButtonHeight = this.data.settingsButton._elementRef.nativeElement.clientHeight;
    const settingsButtonoffsetWidth = this.data.settingsButton._elementRef.nativeElement.offsetWidth;
    const isXs = this.isXs();
    const dialogPositionTop =
      settingsButtonTop + settingsButtonHeight - (isXs ? this.data.dialogHeight - settingsButtonHeight : 0);
    const dialogPositionLeft = settingsButtonLeft + (isXs ? settingsButtonoffsetWidth : -this.data.dialogWidth);
    this.dialogRef.updatePosition({
      top: dialogPositionTop + 'px',
      left: dialogPositionLeft + 'px',
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

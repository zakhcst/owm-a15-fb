import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import {
  SetStatusShowTimeSlotBgPicture,
  SetStatusLiveDataUpdate,
  SetStatusDaysForecast,
  SetStatusShowDetailHumidity,
  SetStatusShowDetailWind,
  SetStatusShowDetailPressure,
  SetStatusShowGChartIcons,
  SetStatusShowGChartWind,
  SetStatusShowGChartHumidity,
  SetStatusPopupType,
} from 'src/app/states/app.actions';
import { Store, Select } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { buildInfo } from '../../../build-info';
import { IStatusBuildInfo } from 'src/app/models/build-info.model';
import { PopupType } from 'src/app/models/snackbar.model';
import { ConstantsService } from 'src/app/services/constants.service';

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
  showDetailTimeSlotBgPicture: boolean;
  liveDataUpdate: boolean;
  popupType: PopupType;
  daysForecast: number;
  daysForecastPrevious: number;
  showDetailPressure: boolean;
  showDetailWind: boolean;
  showDetailHumidity: boolean;
  showGChartWind: boolean;
  showGChartHumidity: boolean;
  showGChartIcons: boolean;
  settingsOptions: {};

  @Select(AppStatusState.updatesAvailable) updatesAvailable$: Observable<boolean>;
  @Select(AppStatusState.buildInfo) buildInfo$: Observable<IStatusBuildInfo>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.reposition();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    // public dialogRef: MatDialogRef<DialogSettingsComponent>,
    public dialogRef: MatDialogRef<any>,
    private _store: Store,
  ) { }

  ngOnInit(): void {
    this.showDetailTimeSlotBgPicture = this._store.selectSnapshot(AppStatusState.showDetailTimeSlotBgPicture);
    this.liveDataUpdate = this._store.selectSnapshot(AppStatusState.liveDataUpdate);
    this.popupType = this._store.selectSnapshot(AppStatusState.popupType);
    this.daysForecast = this._store.selectSnapshot(AppStatusState.daysForecast);
    this.showDetailPressure = this._store.selectSnapshot(AppStatusState.showDetailPressure);
    this.showDetailWind = this._store.selectSnapshot(AppStatusState.showDetailWind);
    this.showDetailHumidity = this._store.selectSnapshot(AppStatusState.showDetailHumidity);
    this.showGChartWind = this._store.selectSnapshot(AppStatusState.showGChartWind);
    this.showGChartHumidity = this._store.selectSnapshot(AppStatusState.showGChartHumidity);
    this.showGChartIcons = this._store.selectSnapshot(AppStatusState.showGChartIcons);

    this.settingsOptions = ConstantsService.toolbar[this.data.currentPageKey].settingsOptions;
    this.daysForecastPrevious = this.daysForecast;
    this.reposition();
  }

  toggleLiveDataUpdate() {
    this.liveDataUpdate = !this.liveDataUpdate;
    this._store.dispatch(new SetStatusLiveDataUpdate(this.liveDataUpdate));
  }
  togglePopupType() {
    this.popupType = this.popupType == PopupType.TOAST ? PopupType.SNACKBAR : PopupType.TOAST;
    this._store.dispatch(new SetStatusPopupType(this.popupType));
  }
  updateDaysForecast() {
    if (this.daysForecastPrevious === this.daysForecast) { return; }
    this.daysForecastPrevious = this.daysForecast;
    this._store.dispatch(new SetStatusDaysForecast(this.daysForecast));
  }
  toggleShowTimeSlotBgPicture() {
    this.showDetailTimeSlotBgPicture = !this.showDetailTimeSlotBgPicture;
    this._store.dispatch(new SetStatusShowTimeSlotBgPicture(this.showDetailTimeSlotBgPicture));
  }
  toggleShowDetailPressure() {
    this.showDetailPressure = !this.showDetailPressure;
    this._store.dispatch(new SetStatusShowDetailPressure(this.showDetailPressure));
  }
  toggleShowDetailWind() {
    this.showDetailWind = !this.showDetailWind;
    this._store.dispatch(new SetStatusShowDetailWind(this.showDetailWind));
  }
  toggleShowDetailHumidity() {
    this.showDetailHumidity = !this.showDetailHumidity;
    this._store.dispatch(new SetStatusShowDetailHumidity(this.showDetailHumidity));
  }
  toggleShowGChartWind() {
    this.showGChartWind = !this.showGChartWind;
    this._store.dispatch(new SetStatusShowGChartWind(this.showGChartWind));
  }
  toggleShowGChartHumidity() {
    this.showGChartHumidity = !this.showGChartHumidity;
    this._store.dispatch(new SetStatusShowGChartHumidity(this.showGChartHumidity));
  }
  toggleShowGChartIcons() {
    this.showGChartIcons = !this.showGChartIcons;
    this._store.dispatch(new SetStatusShowGChartIcons(this.showGChartIcons));
  }

  get isXs() {
    return this.data.mediaObserver.isActive('xs500w');
  }

  get dialogHeight() {
    const windowHeight = window.innerHeight;
    return (windowHeight < this.data.collapsibleHeight) ? (windowHeight - this.data.margin + 'px') : 'auto';
  }

  get dialogPositionLeft() {
    const settingsButtonLeft = this.data.settingsButton._elementRef.nativeElement.offsetLeft || document.body.clientWidth;
    const settingsButtonoffsetWidth = this.data.settingsButton._elementRef.nativeElement.offsetWidth;
    return (settingsButtonLeft + (this.isXs ? settingsButtonoffsetWidth + 10 : -(this.data.width + 10)));
  }

  checkButtonVisibility() {
    const settingsButtonTop = this.data.settingsButton._elementRef.nativeElement.offsetTop;
    if (!settingsButtonTop) {
      this.closeDialog();
    }
  }

  reposition() {
    this.checkButtonVisibility();
    this.dialogRef.updateSize(this.data.width + 'px', this.dialogHeight);
    this.dialogRef.updatePosition({
      top: this.data.dialogPositionTop + 'px',
      left: this.dialogPositionLeft + 'px',
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

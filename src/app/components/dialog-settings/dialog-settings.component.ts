import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SetStatusShowTimeSlotBgPicture, SetStatusLiveDataUpdate, SetStatusDaysForecast, SetStatusShowDetailHumidity, SetStatusShowDetailWind, SetStatusShowDetailPressure, SetStatusShowChartIcons } from 'src/app/states/app.actions';
import { Store, Select } from '@ngxs/store';
import { AppStatusState } from '../../states/app.state';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { buildInfo } from '../../../build-info';
import { RouterState } from '@ngxs/router-plugin';
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
  showTimeSlotBgPicture: boolean;
  liveDataUpdate: boolean;
  daysForecast: number;
  daysForecastOld: number;
  showDetailPressure: boolean;
  showDetailWind: boolean;
  showDetailHumidity: boolean;
  showChartIcons: boolean;
  settingsOptions: {};

  @Select(AppStatusState.updatesAvailable) updatesAvailable$: Observable<boolean>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.reposition();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogSettingsComponent>,
    private _store: Store,
  ) { }
  
  ngOnInit(): void {
    this.showTimeSlotBgPicture = this._store.selectSnapshot(AppStatusState.showTimeSlotBgPicture);
    this.liveDataUpdate = this._store.selectSnapshot(AppStatusState.liveDataUpdate);
    this.daysForecast = this._store.selectSnapshot(AppStatusState.daysForecast);
    this.showDetailPressure = this._store.selectSnapshot(AppStatusState.showDetailPressure);
    this.showDetailWind = this._store.selectSnapshot(AppStatusState.showDetailWind);
    this.showDetailHumidity = this._store.selectSnapshot(AppStatusState.showDetailHumidity);
    const routePathEndSegment = this._store.selectSnapshot(RouterState.url).split('/').pop() || ConstantsService.toolbarElements.forecastFlex.path;
    this.settingsOptions = ConstantsService.toolbar[routePathEndSegment].settingsOptions;
    this.showChartIcons = this._store.selectSnapshot(AppStatusState.showChartIcons);

    this.daysForecastOld = this.daysForecast;
    this.reposition();
  }

  updateDaysForecast() {
    if (this.daysForecastOld === this.daysForecast) return;
    this.daysForecastOld = this.daysForecast;
    this._store.dispatch(new SetStatusDaysForecast(this.daysForecast));
  }

  toggleShowTimeSlotBgPicture() {
    this.showTimeSlotBgPicture = !this.showTimeSlotBgPicture;
    this._store.dispatch(new SetStatusShowTimeSlotBgPicture(this.showTimeSlotBgPicture));
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
  toggleShowChartIcons() {
    this.showChartIcons = !this.showChartIcons;
    this._store.dispatch(new SetStatusShowChartIcons(this.showChartIcons));
  }

  isXs() {
    return this.data.mediaObserver.isActive('xs500w');
  }

  reposition() {
    const settingsButtonTop = this.data.settingsButton._elementRef.nativeElement.offsetTop;
    if (!settingsButtonTop) {
      this.closeDialog();
    }
    const settingsButtonLeft = this.data.settingsButton._elementRef.nativeElement.offsetLeft || document.body.clientWidth;
    const isXs = this.isXs();
    const settingsButtonoffsetWidth = this.data.settingsButton._elementRef.nativeElement.offsetWidth;
    const dialogPositionLeft = settingsButtonLeft + (isXs ? settingsButtonoffsetWidth + 10  : - (this.data.dialogWidth + 10));
    const windowHeight = window.innerHeight;
    if (windowHeight < this.settingsOptions['dialogMaxHeight']) {
      this.dialogRef.updateSize(this.data.dialogWidth + 'px', (windowHeight - this.data.dialogMargin) + 'px');
    }
    this.dialogRef.updatePosition({
      top: this.data.dialogPositionTop + 'px',
      left: dialogPositionLeft + 'px',
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

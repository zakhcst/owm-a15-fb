import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { IOwmDataModelTimeSlotUnit } from 'src/app/models/owm-data.model';
import { ConstantsService } from '../../services/constants.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { AppStatusState } from 'src/app/states/app.state';

@Component({
  selector: 'app-data-cell-expanded',
  templateUrl: './data-cell-expanded.component.html',
  styleUrls: ['./data-cell-expanded.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataCellExpandedComponent implements OnInit {
  iconsOwm: string = ConstantsService.iconsOwm;
  timeSlotData: IOwmDataModelTimeSlotUnit;
  dateTime: number;
  timeSlotBgStyle: {};
  conditionStyle = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DataCellExpandedComponent>,
    private _store: Store
  ) {
    this.timeSlotData = data.timeSlotData;
    this.dateTime = this.timeSlotData.dt * 1000;
  }

  ngOnInit() {
    const iconCode = this.timeSlotData.weather[0].icon;
    const iconIndex = ConstantsService.iconsWeatherMap[iconCode];
    const iconSize = ConstantsService.iconsWeatherSize2;
    this.conditionStyle = {
      'background-position': '0 -' + iconIndex * iconSize + 'px',
    };
    const showTimeSlotBgPicture = this._store.selectSnapshot(AppStatusState.showTimeSlotBgPicture);
    this.setBackground(showTimeSlotBgPicture);
  }

  setBackground(showTimeSlotBgPicture: boolean) {
    if (showTimeSlotBgPicture) {
      const bgImgPath = ConstantsService.getWeatherBgImg(this.timeSlotData);
      const urlBgImgPath = `url(${bgImgPath})`;
      this.timeSlotBgStyle = {
        'background-image': urlBgImgPath,
      };
    } else {
      this.timeSlotBgStyle = {
        'background-color': this.data.bgColor.slice(0, 7),
        filter: 'saturate(75%)',
      };
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

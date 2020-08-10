import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { IOwmDataModelTimeSlotUnit } from 'src/app/models/owm-data.model';
import { ConstantsService } from '../../services/constants.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-data-cell-expanded',
  templateUrl: './data-cell-expanded.component.html',
  styleUrls: ['./data-cell-expanded.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataCellExpandedComponent {
  
  iconsOwm: string = ConstantsService.iconsOwm;
  bgImgPath: string;
  timeSlotData: IOwmDataModelTimeSlotUnit;
  dateTime: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DataCellExpandedComponent>) {
    this.timeSlotData = data.timeSlotData;
    this.dateTime = this.timeSlotData.dt * 1000;
    this.bgImgPath = ConstantsService.getWeatherBgImg(this.timeSlotData);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

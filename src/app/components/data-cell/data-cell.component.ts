import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ITimeTemplate } from 'src/app/models/hours.model';
import { IOwmDataModelTimeSlotUnit } from 'src/app/models/owm-data.model';
import { ConstantsService } from 'src/app/services/constants.service';
import { AppStatusState } from 'src/app/states/app.state';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-data-cell',
  templateUrl: './data-cell.component.html',
  styleUrls: ['./data-cell.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataCellComponent implements OnInit {
  @Input() dataDaily: IOwmDataModelTimeSlotUnit;
  @Input() timeSlot: ITimeTemplate;

  iconsOwm: string = ConstantsService.iconsOwm;
  iconWind: string = ConstantsService.iconWind;
  iconHumidity: string = ConstantsService.iconHumidity;
  iconPressure: string = ConstantsService.iconPressure;
  arrow000Deg: string = ConstantsService.arrow000Deg;
  urlBgImgPath: string = '';

  @Select(AppStatusState.timeSlotBgPicture) timeSlotBgPicture$: Observable<boolean>;

  constructor() {}

  ngOnInit() {
    this.timeSlotBgPicture$.subscribe(timeSlotBgPicture => {
      this.setBackground(timeSlotBgPicture);
    })
  }
  
  setBackground(show) {
    if (this.dataDaily[this.timeSlot.hour] && show) {
      const bgImgPath = ConstantsService.getWeatherBgImg(this.dataDaily[this.timeSlot.hour]);
      this.urlBgImgPath = `url(${bgImgPath})`;
    } else {
      this.urlBgImgPath = '';
    }
  }
}

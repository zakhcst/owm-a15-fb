import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ITimeTemplate } from 'src/app/models/hours.model';
import { IOwmDataModelTimeSlotUnit } from 'src/app/models/owm-data.model';
import { ConstantsService } from 'src/app/services/constants.service';
import { AppStatusState } from 'src/app/states/app.state';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-data-cell',
  templateUrl: './data-cell.component.html',
  styleUrls: ['./data-cell.component.css'],
})
export class DataCellComponent implements OnInit, OnDestroy {
  @Input() dataDaily: IOwmDataModelTimeSlotUnit;
  @Input() timeSlot: ITimeTemplate;

  subscription: Subscription;
  iconsOwm: string = ConstantsService.iconsOwm;
  iconWind: string = ConstantsService.iconWind;
  iconHumidity: string = ConstantsService.iconHumidity;
  iconPressure: string = ConstantsService.iconPressure;
  arrow000Deg: string = ConstantsService.arrow000Deg;
  timeSlotBgStyle = {};

  @Select(AppStatusState.timeSlotBgPicture) timeSlotBgPicture$: Observable<boolean>;

  constructor() {}

  ngOnInit() {
    this.subscription = this.timeSlotBgPicture$.subscribe((showTimeSlotBgPicture) => {
      this.setBackground(showTimeSlotBgPicture);
    });
  }

  setBackground(showTimeSlotBgPicture: boolean) {
    if (this.dataDaily[this.timeSlot.hour] && showTimeSlotBgPicture) {
      const bgImgPath = ConstantsService.getWeatherBgImg(this.dataDaily[this.timeSlot.hour]);
      this.timeSlotBgStyle = {
        'background-image': `url(${bgImgPath})`,
      };
    } else {
      this.timeSlotBgStyle = {
        'background-color': this.timeSlot.bgColor,
      };
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

  }
}

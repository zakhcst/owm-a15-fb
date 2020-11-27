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
  arrow000Deg: string = ConstantsService.arrow000Deg;
  timeSlotBgStyle = {};
  conditionStyle = {};

  @Select(AppStatusState.timeSlotBgPicture) timeSlotBgPicture$: Observable<boolean>;

  constructor() {}

  ngOnInit() {
    this.setIcons();
    this.subscription = this.timeSlotBgPicture$.subscribe((showTimeSlotBgPicture) => {
      this.setBackground(showTimeSlotBgPicture);
    });
  }

  setIcons() {
    if (this.dataDaily[this.timeSlot.hour]) {
      const iconCode = this.dataDaily[this.timeSlot.hour].weather[0].icon;
      const iconIndex = ConstantsService.iconsWeatherMap[iconCode];
      const iconSize = ConstantsService.iconsWeatherSize2;
      this.conditionStyle = {
        'background-position': '0 -' + iconIndex * iconSize + 'px',
      };
    }
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

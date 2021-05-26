import { Component, OnInit, Input, OnDestroy, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { ITimeTemplate } from 'src/app/models/hours.model';
import { IOwmDataModelTimeSlotUnit } from 'src/app/models/owm-data.model';
import { ConstantsService } from 'src/app/services/constants.service';
import { AppStatusState } from 'src/app/states/app.state';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { OwmDataUtilsService } from 'src/app/services/owm-data-utils.service';

@Component({
  selector: 'app-data-cell',
  templateUrl: './data-cell.component.html',
  styleUrls: ['./data-cell.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataCellComponent implements OnInit, OnDestroy {
  @Input() dataDaily: IOwmDataModelTimeSlotUnit;
  @Input() timeSlot: ITimeTemplate;

  subscription: Subscription;
  iconsOwm: string = ConstantsService.iconsOwm;
  arrow000Deg: string = ConstantsService.arrow000Deg;
  timeSlotBgStyle = {};
  conditionStyle = {};

  @Select(AppStatusState.showDetailTimeSlotBgPicture) showDetailTimeSlotBgPicture$: Observable<boolean>;

  constructor(private hostElementRef: ElementRef, private _utils: OwmDataUtilsService) {}

  ngOnInit() {
    if (this.dataDaily[this.timeSlot.hour]) {
      this.setWeatherConditionIcon();
      this.subscribeShowBackgroundPictire();
    }
  }
  
  setWeatherConditionIcon() {
    if (this.dataDaily[this.timeSlot.hour]) {
      const iconCode = this.dataDaily[this.timeSlot.hour].weather[0].icon;
      const iconIndex = ConstantsService.iconsWeatherMap[iconCode];
      const iconSize = ConstantsService.iconsWeatherSize2;
      this.conditionStyle = {
        'background-position': '0 -' + iconIndex * iconSize + 'px',
      };
    }
  }

  subscribeShowBackgroundPictire() {
    this.subscription = this.showDetailTimeSlotBgPicture$.subscribe((showDetailTimeSlotBgPicture) => {
      this.setBackground(showDetailTimeSlotBgPicture);
    });
  }
  
  setBackground(showDetailTimeSlotBgPicture: boolean) {
    if (this.dataDaily[this.timeSlot.hour]) {
      const bgImgPath = showDetailTimeSlotBgPicture ? this._utils.getWeatherBgImg(this.dataDaily[this.timeSlot.hour]) : '';
      this.hostElementRef.nativeElement.style['background-image'] = showDetailTimeSlotBgPicture ? `url(${bgImgPath})` : '';
      this.hostElementRef.nativeElement.style['background-color'] = showDetailTimeSlotBgPicture ? '' : this.timeSlot.bgColor;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { ITimeTemplate } from 'src/app/models/hours.model';
import { IOwmDataTimeSlotUnit } from 'src/app/models/owm-data.model';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-data-cell',
  templateUrl: './data-cell.component.html',
  styleUrls: ['./data-cell.component.css']
})
export class DataCellComponent {
  @Input() dataDaily: IOwmDataTimeSlotUnit;
  @Input() timeSlot: ITimeTemplate;
  // @Input() isCurrentTimeSlot: boolean;

  iconsUrl: string = ConstantsService.owmIconsUrl;
  iconsOwm: string = ConstantsService.iconsOwm;
  iconWind: string = ConstantsService.iconWind;
  iconHumidity: string = ConstantsService.iconHumidity;
  iconPressure: string = ConstantsService.iconPressure;
  arrow000Deg: string = ConstantsService.arrow000Deg;
  constructor() {}
}

import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_SNACK_BAR_DATA as MAT_SNACK_BAR_DATA } from '@angular/material/legacy-snack-bar';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-snack-bar-inner',
  templateUrl: './app-snack-bar-inner.component.html',
  styleUrls: ['./app-snack-bar-inner.component.css'],
})
export class AppSnackBarInnerComponent {
  textColor: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    this.textColor = ConstantsService.messageTypeColor[data.class];
  }

}


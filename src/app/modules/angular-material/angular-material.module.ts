import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay'
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    OverlayModule,
  ],
  exports: [
    CommonModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    OverlayModule,
  ],
})
export class AngularMaterialModule {}

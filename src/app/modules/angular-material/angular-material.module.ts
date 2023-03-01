import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule as MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule as MatSliderModule } from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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

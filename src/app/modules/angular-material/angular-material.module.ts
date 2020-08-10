import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';

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
    MatDialogModule,
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
    MatDialogModule,
  ]
})
export class AngularMaterialModule {}

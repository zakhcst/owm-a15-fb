import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../modules/shared.module';
import { HeaderToolbarComponent } from './header-toolbar.component';
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
import { RequiredModules } from 'src/app/modules/required.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [HeaderToolbarComponent, DialogSettingsComponent],
  imports: [RouterModule, SharedModule, RequiredModules, MatSlideToggleModule],
  entryComponents: [DialogSettingsComponent]
})
export class HeaderToolbarModule {}

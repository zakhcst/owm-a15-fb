import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../modules/shared.module';
import { HeaderToolbarComponent } from './header-toolbar.component';
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
import { RequiredModules } from 'src/app/modules/required.module';
import { ToastOverlayComponent } from '../toast-overlay/toast-overlay.component';

@NgModule({
  declarations: [HeaderToolbarComponent, DialogSettingsComponent, ToastOverlayComponent],

  imports: [RequiredModules, RouterModule, SharedModule],
  exports: [RequiredModules, RouterModule, SharedModule],
  entryComponents: [DialogSettingsComponent],
})
export class HeaderToolbarModule { }

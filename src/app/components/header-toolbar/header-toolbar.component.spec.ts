import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderToolbarComponent } from './header-toolbar.component';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { AppRoutingModule } from '../../modules/routing.module';
import { appRoutes } from '../../modules/routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderToolbarModule } from './header-toolbar.module';
import { NgxsModule } from '@ngxs/store';
import {
  AppCitiesState,
  AppErrorsState,
  AppFallbackDataState,
  AppHistoryLogState,
  AppOwmDataCacheState,
  AppStatsState,
  AppStatusState,
} from 'src/app/states/app.state';
import { environment } from 'src/environments/environment';
import { ResolverRegisterIconsService } from 'src/app/modules/routing-resolvers/resolver-register-icons.service';
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
import { By } from '@angular/platform-browser';
import { OwmDataManagerService } from 'src/app/services/owm-data-manager.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { InitModules } from 'src/app/modules/init.module';

describe('HeaderToolbarComponent', () => {
  let component: HeaderToolbarComponent;
  let fixture: ComponentFixture<HeaderToolbarComponent>;
  let iconService: ResolverRegisterIconsService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          InitModules,
          AppRoutingModule,
          RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            relativeLinkResolution: 'legacy',
          }),
          MatDialogModule,
          HeaderToolbarModule,
        ],
        declarations: [DialogSettingsComponent, HeaderToolbarComponent],
        providers: [ResolverRegisterIconsService, OwmDataManagerService, ErrorsService],
      }).compileComponents();

      iconService = TestBed.inject(ResolverRegisterIconsService);
      fixture = TestBed.createComponent(HeaderToolbarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should create', () => {
    expect(component).toBeDefined();
  });

  // it('should open and close DialogSettingsComponent modal', () => {
  //   fixture.detectChanges();
  //   const settingsIcon = fixture.debugElement.query(By.css('.mat-icon.button-settings'));
  //   const dialog = component.showSettings({ _elementRef: { nativeElement: settingsIcon.nativeNode } });
  //   fixture.detectChanges();

  //   expect(dialog).toBeDefined();
  //   dialog.componentInstance.closeDialog();
  //   // dialog.close();
  //   // component.dialog.closeAll();
  // });
});

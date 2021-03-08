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

describe('HeaderToolbarComponent', () => {
  let component: HeaderToolbarComponent;
  let fixture: ComponentFixture<HeaderToolbarComponent>;
  let iconService: ResolverRegisterIconsService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          AppRoutingModule,
          RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            relativeLinkResolution: 'legacy',
          }),
          MatDialogModule,
          HeaderToolbarModule,
          NgxsModule.forRoot(
            [
              AppOwmDataCacheState,
              AppErrorsState,
              AppStatusState,
              AppCitiesState,
              AppStatsState,
              AppHistoryLogState,
              AppFallbackDataState,
            ],
            { developmentMode: !environment.production }
          ),
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
    expect(component).toBeTruthy();
  });

  it('should open and close DialogSettingsComponent modal', () => {
    expect(component).toBeDefined();
    const settingsIcon = fixture.debugElement.query(By.css('.mat-icon.button-settings'));
    const dialogRef = component.showSettings({ _elementRef: { nativeElement: settingsIcon.nativeNode } }, false);

    expect(dialogRef).toBeDefined();
    dialogRef.close();
    // component.dialog.closeAll();
  });
});

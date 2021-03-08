import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DialogSettingsComponent } from './dialog-settings.component';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NgxsModule, Store } from '@ngxs/store';
import { HeaderToolbarModule } from '../header-toolbar/header-toolbar.module';
import { HeaderToolbarComponent } from '../header-toolbar/header-toolbar.component';
import { AppRoutingModule } from 'src/app/modules/routing.module';
import { ResolverRegisterIconsService } from 'src/app/modules/routing-resolvers/resolver-register-icons.service';
import {
  AppCitiesState,
  AppErrorsState,
  AppFallbackDataState,
  AppHistoryLogState,
  AppOwmDataCacheState,
  AppStatsState,
} from '../../states/app.state';
import { environment } from 'src/environments/environment';
import { ConstantsService } from 'src/app/services/constants.service';
import { MockHeaderToolbarComponent } from './mock-header-toolbar.component';
import { OwmDataManagerService } from 'src/app/services/owm-data-manager.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MediaObserver } from '@angular/flex-layout';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from 'src/app/modules/shared.module';
import { RouterModule } from '@angular/router';
import { RequiredModules } from 'src/app/modules/required.module';

describe('DialogSettingsComponent', () => {
  const settingsButton = {
    _elementRef: {
      nativeElement: {
        offsetLeft: 500,
        offsetWidth: 300,
      },
    },
  };

  let component: MockHeaderToolbarComponent;
  let fixture: ComponentFixture<MockHeaderToolbarComponent>;
  let matDialog: any;
  let dialogRef: any;
  let iconService: ResolverRegisterIconsService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule,
          AppRoutingModule,
          RequiredModules,
          MatDialogModule,
          MatSlideToggleModule,
          MatSliderModule,
          SharedModule,
          NgxsModule.forRoot(
            [
              AppOwmDataCacheState,
              AppErrorsState,
              AppCitiesState,
              AppStatsState,
              AppHistoryLogState,
              AppFallbackDataState,
            ],
            { developmentMode: !environment.production }
          ),
          HeaderToolbarModule,
        ],
        declarations: [MockHeaderToolbarComponent],
        providers: [
          Store,
          ConstantsService,
          ResolverRegisterIconsService,
          OwmDataManagerService,
          ErrorsService,
          MediaObserver,
        ],
      }).compileComponents();

      matDialog = TestBed.inject(MatDialog);
      iconService = TestBed.inject(ResolverRegisterIconsService);
      fixture = TestBed.createComponent(MockHeaderToolbarComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should open and close DialogSettingsComponent ', () => {
    expect(component).toBeDefined();
    dialogRef = component.showSettings(settingsButton, false);
    expect(dialogRef).toBeDefined();
    dialogRef.close();
  });
});

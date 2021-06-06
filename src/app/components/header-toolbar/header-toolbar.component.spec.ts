import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { HeaderToolbarComponent } from './header-toolbar.component';
import { AppRoutingModule } from '../../modules/routing.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderToolbarModule } from './header-toolbar.module';
import { InitModules } from '../../modules/init.module';
import { ResolverRegisterIconsService } from '../../modules/routing-resolvers/resolver-register-icons.service';

// import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
// import { OwmDataManagerService } from '../../services/owm-data-manager.service';

import { ConstantsService } from '../../services/constants.service';
import { getNewDataObject } from '../../services/testing.services.mocks';
import { WindowRefService } from '../../services/window.service';

describe('HeaderToolbarComponent', () => {
  let component: HeaderToolbarComponent;
  let fixture: ComponentFixture<HeaderToolbarComponent>;
  let iconService: ResolverRegisterIconsService;
  let router: Router;
  let windowRef: any;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [InitModules, AppRoutingModule, MatDialogModule, HeaderToolbarModule],
        // declarations: [DialogSettingsComponent, HeaderToolbarComponent],
        declarations: [HeaderToolbarComponent],
        providers: [
          ResolverRegisterIconsService,
          // OwmDataManagerService,
        ],
      }).compileComponents();

      windowRef = TestBed.inject(WindowRefService);
      iconService = TestBed.inject(ResolverRegisterIconsService);
      router = TestBed.inject(Router);
      fixture = TestBed.createComponent(HeaderToolbarComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
    })
  );
  afterEach(() => {
    component.subscriptions.unsubscribe();
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should onResize', () => {
    const spyOnOnResize = spyOn(component, 'isXs');
    component.onResize();
    expect(spyOnOnResize).toHaveBeenCalledTimes(1);
  });

  it('should subscribeRouterEvents not return when path not in toolbar', fakeAsync(() => {
    const nonExistingRoute = 'nonExistingRoute';
    component.currentPageKey = nonExistingRoute;
    router.navigate([nonExistingRoute]);
    tick(100);
    expect(component.currentPageKey).toBe(nonExistingRoute);
  }));

  it('should subscribeRouterEvents set when path in toolbar', fakeAsync(() => {
    const existingRoute = Object.keys(ConstantsService.toolbar)[0];
    router.navigate([existingRoute]);
    tick(100);
    expect(component.currentPageKey).toBe(existingRoute);
  }));

  it('should subscribeConnected', waitForAsync(() => {
    component.connected = false;
    component.subscriptions.unsubscribe();
    const spyOnConnected = spyOnProperty(component, 'connected$').and.returnValue(of(true));
    component.subscribeConnected();
    expect(component.connected).toBeTrue();
  })
  );

  it('should subscribeConnected debounce on false', waitForAsync(() => {
    component.connected = false;
    component.subscriptions.unsubscribe();
    const spyOnConnected = spyOnProperty(component, 'connected$').and.returnValue(of(false));
    component.subscribeConnected();
    expect(component.connected).toBeFalse();
  })
  );

  it('should subscribeOwmData', waitForAsync(() => {
    component.subscriptions.unsubscribe();
    const data = getNewDataObject();
    component.loaded = false;
    const spyOnGetOwmDataDebounced = spyOn(component['_utils'], 'getOwmDataDebounced$').and.returnValue(of(data));
    const urlBgImg_10 = component['_utils'].getWeatherBgImg(data.list[10]);
    const spyOnGetWeatherBgImg = spyOn(component['_utils'], 'getWeatherBgImg').and.returnValue(urlBgImg_10);
    component.subscribeOwmData();
    expect(component.loaded).toBeTrue();
    expect(component.owmDataExpired).toBeTrue();
  })
  );

  it('should ngOnDestroy', () => {
    expect(component.subscriptions.closed).toBeFalse();
    component.ngOnDestroy();
    expect(component.subscriptions.closed).toBeTrue();
  });

  it('should ngOnDestroy return when no subsciptions', () => {
    expect(component.subscriptions.closed).toBeFalse();
    component.subscriptions.unsubscribe();
    expect(component.subscriptions.closed).toBeTrue();
    const spyOnUnsubscribe = spyOn(component.subscriptions, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(spyOnUnsubscribe).toHaveBeenCalledTimes(0);
    expect(component.subscriptions.closed).toBeTrue();
  });

  it('should toggleActionButtonsXS hide', () => {
    component.xs500w = true;
    component.showActionButtonsXS = true;
    component.toggleActionButtonsXS({});
    expect(component.showActionButtonsXS).toBeFalse();
  });

  it('should toggleActionButtonsXS show when xs500w is false', () => {
    component.xs500w = false;
    component.showActionButtonsXS = true;
    component.toggleActionButtonsXS({});
    expect(component.showActionButtonsXS).toBeTrue();
  });

  it('should toggleActionButtonsXS show when showActionButtonsXS is false', () => {
    component.xs500w = true;
    component.showActionButtonsXS = false;
    component.toggleActionButtonsXS({});
    expect(component.showActionButtonsXS).toBeTrue();
  });

  it('should hideActionButtonsXS', () => {
    component.showActionButtonsXS = true;
    component.hideActionButtonsXS({});
    expect(component.showActionButtonsXS).toBeFalse();
  });

  it('should showSettings', () => {
    component.loaded = true;
    const existingRoute = Object.keys(ConstantsService.toolbar)[0];
    component.currentPageKey = existingRoute;

    const opened: any = 'opened';
    const spyOnDialogOpen = spyOn(component['dialog'], 'open').and.returnValue(opened);
    const settingsButton = { _elementRef: { nativeElement: { offsetLeft: 100, offsetWidth: 300 } } };

    const dialog = component.showSettings(settingsButton);
    expect(dialog).toBe(opened);
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(1);
  }
  );

  it('should showSettings when isXs is true and windowHeight < collapsibleHeight', () => {
    component.loaded = true;
    const existingRoute = Object.keys(ConstantsService.toolbar)[0];
    component.currentPageKey = existingRoute;
    const opened: any = 'opened';

    const spyOnDialogOpen = spyOn(component['dialog'], 'open').and.returnValue(opened);
    const spyOnIsXs = spyOn(component, 'isXs').and.returnValue(true);

    const { collapsibleHeight } = ConstantsService.toolbar[existingRoute].settingsDialog;
    windowRef.nativeWindow.innerHeight = collapsibleHeight - 1;
    const settingsButton = { _elementRef: { nativeElement: { offsetLeft: 100, offsetWidth: 300 } } };

    const dialog = component.showSettings(settingsButton);
    expect(dialog).toBe(opened);
    expect(spyOnDialogOpen).toHaveBeenCalledTimes(1);
  }
  );

  it('should selectedCityChange', () => {
    const spyOnStoreDispatch = spyOn(component['_store'], 'dispatch');
    component.selectedCityChange();
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
  });

  it('should addError', () => {
    const spyOnErrorsAdd = spyOn(component['_errors'], 'add');
    component.addError('test custom message', 'test error message');
    expect(spyOnErrorsAdd).toHaveBeenCalledTimes(1);
  });

});

import { DOCUMENT } from '@angular/common';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Store } from '@ngxs/store';
import { InitModules } from '../modules/init.module';
import { AppRoutingModule } from '../modules/routing.module';
import { SetStatusAway, SetStatusBuildInfo, SetStatusConnected, SetStatusUpdatesAvailable } from '../states/app.actions';

import { AppInitService } from './app-init.service';
import { OwmDataManagerService } from './owm-data-manager.service';
import { PresenceService } from './presence.service';
import { SnackbarService } from './snackbar.service';
import { ConstantsService } from './constants.service';
import { MockPresenceService, MockSwUpdate, MockDocument } from './testing.services.mocks';

describe('AppInitService', () => {
  let service: AppInitService;
  let store: Store;
  let swUpdate: any;
  let mockSwUpdate: any;
  let presenceService: any;
  let mockPresenceService: any;
  let mockDocument: any;
  let _document: any;

  beforeEach(() => {
    mockSwUpdate = new MockSwUpdate();
    mockPresenceService = new MockPresenceService();
    mockDocument = new MockDocument();

    TestBed.configureTestingModule({
      imports: [
        InitModules,
        AppRoutingModule,
      ],
      providers: [
        AppInitService,
        Store,
        { provide: OwmDataManagerService, useValue: null },
        { provide: SnackbarService, useValue: null },
        { provide: SwUpdate, useValue: mockSwUpdate },
        { provide: PresenceService, useValue: mockPresenceService },
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });
    service = TestBed.inject(AppInitService);
    store = TestBed.inject(Store);
    swUpdate = TestBed.inject(SwUpdate);
    presenceService = TestBed.inject(PresenceService);
    _document = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initCss', () => {
    const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue(true);
    const spyOnSetProperty = spyOn(_document.documentElement.style, 'setProperty');
    const iconsAndPropertiesSum = ConstantsService.initCssIconsList.length + ConstantsService.initCssShowPropertiesList.length;
    service.initCss();
    expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(ConstantsService.initCssShowPropertiesList.length);
    expect(spyOnSetProperty).toHaveBeenCalledTimes(iconsAndPropertiesSum);
  });

  it('should initCss no propeties or set to false', () => {
    const spyOnSelectSnapshot = spyOn(store, 'selectSnapshot').and.returnValue(false);
    const spyOnSetProperty = spyOn(_document.documentElement.style, 'setProperty');
    const iconsAndPropertiesSum = ConstantsService.initCssIconsList.length + ConstantsService.initCssShowPropertiesList.length;
    service.initCss();
    expect(spyOnSelectSnapshot).toHaveBeenCalledTimes(ConstantsService.initCssShowPropertiesList.length);
    expect(spyOnSetProperty).toHaveBeenCalledTimes(iconsAndPropertiesSum);
  });

  it('should setSubscribeOnUpdates', waitForAsync(() => {
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const calls = spyOnStoreDispatch.calls;
    let buildInfo = {
      current: mockSwUpdate.eventUpdate.current.appData.buildInfo,
      available: mockSwUpdate.eventUpdate.available.appData.buildInfo,
    };
    mockSwUpdate.availableUpdate(mockSwUpdate.eventUpdate);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
    expect(spyOnStoreDispatch).toHaveBeenCalledWith(new SetStatusUpdatesAvailable(true));
    expect(calls.allArgs()[1][0]).toEqual(new SetStatusBuildInfo(buildInfo));

    delete mockSwUpdate.eventUpdate.current.appData;
    delete mockSwUpdate.eventUpdate.available.appData;
    buildInfo = {
      current: undefined,
      available: undefined
    };
    mockSwUpdate.availableUpdate(mockSwUpdate.eventUpdate);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(4);
    expect(calls.allArgs()[2][0]).toEqual(new SetStatusUpdatesAvailable(true));
    expect(calls.allArgs()[3][0]).toEqual(new SetStatusBuildInfo(buildInfo));
    delete mockSwUpdate.eventUpdate.current;
    delete mockSwUpdate.eventUpdate.available;
    buildInfo = {
      current: undefined,
      available: undefined
    };
    mockSwUpdate.availableUpdate(mockSwUpdate.eventUpdate);
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(6);
    expect(calls.allArgs()[4][0]).toEqual(new SetStatusUpdatesAvailable(true));
    expect(calls.allArgs()[5][0]).toEqual(new SetStatusBuildInfo(buildInfo));
  }));

  it('should startListenerOnAway', waitForAsync(() => {
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    const spyOnPresenceUpdateOnAway = spyOn(presenceService, 'updateOnAway').and.callThrough();

    _document.visibilityState = 'hidden';
    service.startListenerOnAway();
    expect(_document.visibilityState).toBe('hidden');
    expect(spyOnStoreDispatch).toHaveBeenCalledWith(new SetStatusAway(true));
    expect(spyOnPresenceUpdateOnAway).toHaveBeenCalledTimes(1);

    _document.visibilityState = 'visible';
    service.startListenerOnAway();
    expect(_document.visibilityState).toBe('visible');
    expect(spyOnStoreDispatch.calls.allArgs()[1][0]).toEqual(new SetStatusAway(false));
    expect(spyOnPresenceUpdateOnAway).toHaveBeenCalledTimes(2);
  }));

  it('should setSubscribeOnConnected', waitForAsync(() => {
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    presenceService.connectedUpdate(true);
    expect(spyOnStoreDispatch).toHaveBeenCalledWith(new SetStatusConnected(true));

    presenceService.connectedUpdate(false);
    expect(spyOnStoreDispatch.calls.allArgs()[1][0]).toEqual(new SetStatusConnected(false));
    presenceService.connectedComplete();
  }));

  it('should shutdown', waitForAsync(() => {
    const spyOnStoreDispatch = spyOn(store, 'dispatch');
    service.shutdown();
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(2);
  }));

});

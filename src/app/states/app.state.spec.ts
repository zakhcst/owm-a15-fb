import { TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/database';

import {
  AppOwmDataCacheState,
  AppErrorsState,
  AppStatusState,
  AppCitiesState,
  AppStatsState,
  AppHistoryLogState,
  AppFallbackDataState,
  AppPopupMessages,
} from './app.state';
import { GetBrowserIpService } from '../services/get-browser-ip.service';
import { SnackbarService } from '../services/snackbar.service';

import {
  MockAngularFireService,
  MockSnackbarService,
  MockGetBrowserIpService,
} from '../services/testing.services.mocks';

import { Store } from '@ngxs/store';
import { AppErrorPayloadModel } from './app.models';
import { AppSnackBarInnerComponent } from '../components/app-snack-bar-inner/app-snack-bar-inner.component';

import dataJSON from '../../assets/owm-fallback-data.json';
import { AppModule } from '../app.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('State store', () => {
  let mockSnackbarService: any;
  let mockAngularFireService: any;
  let mockGetBrowserIpService: MockGetBrowserIpService;
  let store: Store;

  let appStatusState: AppStatusState;
  let appOwmDataCacheState: AppOwmDataCacheState;
  let appErrorsState: AppErrorsState;
  let appCitiesState: AppCitiesState;
  let appStatsState: AppStatsState;
  let appHistoryLogState: AppHistoryLogState;
  let appFallbackDataState: AppFallbackDataState;
  let appPopupMessages: AppPopupMessages;

  const mockHistoryData = { owmData: dataJSON };
  const mockErrorData: AppErrorPayloadModel = {
    userMessage: 'mockErrorData: AppErrorPayloadModel: value: userMessage',
    logMessage: 'mockErrorData: AppErrorPayloadModel: value: logMessage',
  };

  beforeEach(
    waitForAsync(() => {
      mockSnackbarService = new MockSnackbarService();
      mockAngularFireService = new MockAngularFireService();
      mockGetBrowserIpService = new MockGetBrowserIpService();
      TestBed.configureTestingModule({
        declarations: [AppSnackBarInnerComponent],
        imports: [AppModule, MatSnackBarModule],
        providers: [
          AppStatusState,
          AppOwmDataCacheState,
          AppErrorsState,
          AppCitiesState,
          AppStatsState,
          AppHistoryLogState,
          AppFallbackDataState,
          Store,
          SnackbarService,
          { provide: AngularFireDatabase, useValue: mockAngularFireService },
          { provide: SnackbarService, useValue: mockSnackbarService },
          { provide: GetBrowserIpService, useValue: mockGetBrowserIpService },
        ],
      }).compileComponents();

      store = TestBed.inject(Store);
      appStatusState = TestBed.inject(AppStatusState);
      appOwmDataCacheState = TestBed.inject(AppOwmDataCacheState);
      appErrorsState = TestBed.inject(AppErrorsState);
      appCitiesState = TestBed.inject(AppCitiesState);
      appStatsState = TestBed.inject(AppStatsState);
      appHistoryLogState = TestBed.inject(AppHistoryLogState);
      appFallbackDataState = TestBed.inject(AppFallbackDataState);
      appPopupMessages = TestBed.inject(AppPopupMessages);
    })
  );

  afterEach(() => {
    store = null;
    mockSnackbarService = null;
    mockAngularFireService = null;
    mockGetBrowserIpService = null;
  });

  it('should create AppStatusState', () => {
    expect(appStatusState).toBeTruthy();
  });
  it('should create AppOwmDataCacheState', () => {
    expect(appOwmDataCacheState).toBeTruthy();
  });
  it('should create AppErrorsState', () => {
    expect(appErrorsState).toBeTruthy();
  });
  it('should create AppCitiesState', () => {
    expect(appCitiesState).toBeTruthy();
  });
  it('should create AppStatsState', () => {
    expect(appStatsState).toBeTruthy();
  });
  it('should create AppHistoryLogState', () => {
    expect(appHistoryLogState).toBeTruthy();
  });
  it('should create AppFallbackDataState', () => {
    expect(appFallbackDataState).toBeTruthy();
  });
  it('should create AppPopupMessages', () => {
    expect(appPopupMessages).toBeTruthy();
  });
  it('should create AppPopupMessages', () => {
    expect(appPopupMessages.setPopupMessage).toBeTruthy();
  });
});

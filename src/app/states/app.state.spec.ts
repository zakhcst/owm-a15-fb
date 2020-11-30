import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { AngularFireDatabaseModule, AngularFireDatabase } from '@angular/fire/database';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment.prod';

import { AppHistoryState, AppErrorsState } from './app.state';
import { GetBrowserIpService } from '../services/get-browser-ip.service';
import { SnackbarService } from '../services/snackbar.service';

import {
  MockAngularFireService,
  MockSnackbarService,
  MockGetBrowserIpService,
} from '../services/testing.services.mocks';

import { NgxsModule, Store } from '@ngxs/store';
import { SetHistoryState, SetErrorsState } from './app.actions';
import { AppHistoryPayloadModel, AppErrorPayloadModel } from './app.models';
import { AppSnackBarInnerComponent } from '../components/app-snack-bar-inner/app-snack-bar-inner.component';

import dataJSON from '../../assets/owm-fallback-data.json';

describe('State store', () => {
  let mockSnackbarService: any;
  let mockAngularFireService: any;
  let mockGetBrowserIpService: MockGetBrowserIpService;
  let store: Store;

  const mockHistoryData: AppHistoryPayloadModel = { owmData: dataJSON };
  const mockErrorData: AppErrorPayloadModel = {
    userMessage: 'mockErrorData: AppErrorPayloadModel: value: userMessage',
    logMessage: 'mockErrorData: AppErrorPayloadModel: value: logMessage',
  };

  beforeEach(waitForAsync(() => {
    mockSnackbarService = new MockSnackbarService();
    mockAngularFireService = new MockAngularFireService();
    mockGetBrowserIpService = new MockGetBrowserIpService();
    TestBed.configureTestingModule({
      declarations: [AppSnackBarInnerComponent],
      imports: [
        RequiredModules,
        NgxsModule.forRoot([AppHistoryState, AppErrorsState], {
          developmentMode: true,
        }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
      ],
      providers: [
        Store,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        { provide: SnackbarService, useValue: mockSnackbarService },
        { provide: GetBrowserIpService, useValue: mockGetBrowserIpService },
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [AppSnackBarInnerComponent],
        },
      })
      .compileComponents();

    store = TestBed.get(Store);
  }));

  afterEach(() => {
    store = null;
    mockSnackbarService = null;
    mockAngularFireService = null;
    mockGetBrowserIpService = null;
  });

  it('should dispatch a new AppHistoryState ', (done: DoneFn) => {
    // it('should dispatch a new AppHistoryState ', async(() => {
    store.dispatch(new SetHistoryState(mockHistoryData)).subscribe(() => {
      store
        .selectOnce((state) => state.activity.sessionHistory)
        .subscribe((state1) => {
          expect(state1.length).toBe(1);
          expect(state1[0].cityId).toBe(mockHistoryData.owmData.city.id);
          done();
        });
    });
  });
  // }));

  it('should dispatch a new AppErrorsState', (done: DoneFn) => {
    // it('should dispatch a new AppErrorsState', async(() => {
    store
      .selectOnce((state) => state.errors.sessionErrors)
      .subscribe(
        (state0) => {
          expect(state0.length).toBe(1);
          expect(state0[0].logMessage).toBe('Init');
          store.dispatch(new SetErrorsState(mockErrorData)).subscribe(() => {
            store
              .selectOnce((state) => state.errors.sessionErrors)
              .subscribe((state1) => {
                expect(state1.length).toBe(2);
                expect(state1[1].logMessage).toEqual(mockErrorData.logMessage);
                done();
              });
          });
        },
        (error) => fail(error)
      );
    // }));
  });
});

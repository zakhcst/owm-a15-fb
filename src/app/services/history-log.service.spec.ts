import { Store } from '@ngxs/store';
import { AngularFireDatabase } from '@angular/fire/compat/database';

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';

import { InitModules } from '../modules/init.module';
import { cold } from 'jasmine-marbles';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { HistoryLogModel } from '../states/app.models';
import { IHistoryLog } from '../models/history-log.model';
import { HistoryLogService } from './history-log.service';
import { historyLogMockData, MockAngularFireService } from './testing.services.mocks';

describe('HistoryLogService', () => {
  const testData: HistoryLogModel = { cityId: 'cityId', time: 0 };
  let service: HistoryLogService;
  let store: Store;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: any;

  beforeEach(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      imports: [InitModules, RequiredModules],
      providers: [
        HistoryLogService,
        Store,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
      ],
    });
    service = TestBed.inject(HistoryLogService);
    store = TestBed.inject(Store);
    angularFireDatabase = TestBed.inject(AngularFireDatabase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getData', waitForAsync(() => {
    const spyOnmockAngularFireService = spyOn(mockAngularFireService.ref, 'valueChanges').and.callThrough();
    service.getData().subscribe();
    expect(spyOnmockAngularFireService).toHaveBeenCalledTimes(1);
  }));

  it('should dispatch history log', () => {
    const spyDispatch = spyOn(store, 'dispatch');
    service.dispatch(testData);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });

  it('should activateLiveDataUpdatesHistoryLog subscribeToGetData when liveDataUpdate$ is true', waitForAsync(() => {
    const q$ = cold('-t|', { t: true, f: false });
    service.getDataSubscription.unsubscribe();
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);

    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(0);
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(1);
    });
    service.activateLiveDataUpdatesHistoryLog();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should activateLiveDataUpdatesHistoryLog getDataOnce when liveDataUpdate$ is false', waitForAsync(() => {
    const q$ = cold('-f|', { t: true, f: false });
    service.getDataSubscription.unsubscribe();
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);

    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(1);
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(0);
    });
    service.activateLiveDataUpdatesHistoryLog();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should getDataOnce when AppHistoryLogState.selectHistoryLog is null', waitForAsync(() => {
    const historyLogData: IHistoryLog = historyLogMockData;
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(null);
    const spyOnGetData = spyOn(service, 'getData').and.returnValue(of(historyLogData));
    const spyDispatch = spyOn(store, 'dispatch');
    service.getDataOnce();
    expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  }));

  it('should not getDataOnce when AppHistoryLogState.selectHistoryLog is not null', waitForAsync(() => {
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(true);
    const spyOnGetData = spyOn(service, 'getData');
    service.getDataOnce();
    expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(0);
  }));

});

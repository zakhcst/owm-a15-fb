import { TestBed, waitForAsync } from '@angular/core/testing';
import { StatsService } from './stats.service';
import { MockAngularFireService } from './testing.services.mocks';
import { AngularFireDatabase } from '@angular/fire/database';
import { NgxsModule, Store } from '@ngxs/store';
import { of } from 'rxjs';
import { cold } from 'jasmine-marbles';
import { delay } from 'rxjs/operators';

describe('StatsService', () => {
  let service: StatsService;
  let store: Store;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: AngularFireDatabase;

  beforeEach(
    waitForAsync(() => {
      mockAngularFireService = new MockAngularFireService();
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([])],
        providers: [
          Store,
          StatsService,
          { provide: AngularFireDatabase, useValue: mockAngularFireService },
        ],
      });
      service = TestBed.inject(StatsService);
      store = TestBed.inject(Store);
      angularFireDatabase = TestBed.inject(AngularFireDatabase);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getData', waitForAsync(() => {
    const spyOnmockAngularFireService = spyOn(mockAngularFireService.ref, 'valueChanges').and.callThrough();
    service.getData().subscribe();
    expect(spyOnmockAngularFireService).toHaveBeenCalledTimes(1);
  }));

  it('should dispatch stats', () => {
    const spyDispatch = spyOn(store, 'dispatch');
    service.dispatch('testData');
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });

  it('should subscribeToGetData', () => {
    const spyDispatch = spyOn(store, 'dispatch');
    service.subscribeToGetData();
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });


  it('should activateLiveDataUpdatesStats subscribeToGetData when liveDataUpdate$ is true', waitForAsync(() => {
    const q$ = cold('-t|', { t: true, f: false });
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);
    
    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(0);
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(1);
    });
    service.activateLiveDataUpdatesStats();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should activateLiveDataUpdatesStats getDataOnce when liveDataUpdate$ is false', waitForAsync(() => {
    const q$ = cold('-f|', { t: true, f: false });
    console.log(service.getDataSubscription);
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);

    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(1);
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(0);
    });
    service.activateLiveDataUpdatesStats();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should activateLiveDataUpdatesStats subscribeToGetData when liveDataUpdate$ is true unsubacribe active getDataSubscription', waitForAsync(() => {
    const q$ = cold('-t--t|', { t: true, f: false });
    service.liveDataUpdateSubscription.unsubscribe();
    const spyDispatch = spyOn(store, 'dispatch');
    const spyOnGetDataOnce = spyOn(service, 'getDataOnce');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(q$);
    
    q$.pipe(delay(10)).subscribe(() => {
      expect(spyOnGetDataOnce).toHaveBeenCalledTimes(0);
      expect(spyDispatch).toHaveBeenCalledTimes(2);
    });
    service.activateLiveDataUpdatesStats();
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));


  it('should getDataOnce when AppStatsState.selectStats is null', waitForAsync(() => {
    const statsData = {};
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(null);
    const spyOnGetData = spyOn(service, 'getData').and.returnValue(of(statsData));
    const spyDispatch = spyOn(store, 'dispatch');
    service.getDataOnce();
    expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(1);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  }));

  it('should not getDataOnce when AppStatsState.selectStats is not null', waitForAsync(() => {
    const spyOnStoreSelect = spyOn(store, 'selectSnapshot').and.returnValue(true);
    const spyOnGetData = spyOn(service, 'getData');
    service.getDataOnce();
    expect(spyOnStoreSelect).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(0);
  }));

});

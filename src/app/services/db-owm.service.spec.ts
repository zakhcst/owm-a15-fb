import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { RequiredModules } from '../modules/required.module';
import { DbOwmService } from './db-owm.service';
import { MockAngularFireService } from './testing.services.mocks';
import { AngularFireDatabase } from '@angular/fire/database';
import { IOwmDataModel } from '../models/owm-data.model';
import { getNewDataObject } from './testing.services.mocks';
import { InitModules } from '../modules/init.module';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { ConstantsService } from './constants.service';

describe('DbOwmService', () => {
  const testData: IOwmDataModel = getNewDataObject();
  let service: DbOwmService;
  let store: Store;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: any;
  const cityId = 'cityId';

  beforeEach(
    waitForAsync(() => {
      mockAngularFireService = new MockAngularFireService();
      TestBed.configureTestingModule({
        imports: [InitModules, RequiredModules],
        providers: [DbOwmService, Store, { provide: AngularFireDatabase, useValue: mockAngularFireService }],
      });
      service = TestBed.inject(DbOwmService);
      store = TestBed.inject(Store);
      angularFireDatabase = TestBed.inject(AngularFireDatabase);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should setData', (done) => {
    service.setData(cityId, testData).then((response) => {
      expect(mockAngularFireService.fbdata).toEqual(testData);
      expect(<string>(<any>response)).toBe('Resolved');
      done();
    });
  });

  it('should getData', waitForAsync(() => {
      const spyOnmockAngularFireService = spyOn(mockAngularFireService.ref, 'valueChanges').and.callThrough();
      service.getData(cityId).subscribe();
      expect(spyOnmockAngularFireService).toHaveBeenCalledTimes(1);
    })
  );

  it('should dispatch', () => {
    const spyDispatch = spyOn(store, 'dispatch');
    service.dispatch(testData);
    expect(spyDispatch).toHaveBeenCalledTimes(1);
  });

  it('should activateLiveDataUpdateDB subscribeToGetData when liveDataUpdate$ is true', fakeAsync(() => {
      service.getDataSubscription.unsubscribe();
      service.liveDataUpdateSubscription.unsubscribe();
      const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
      const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(of(true));

      service.activateLiveDataUpdateDB();
      tick();
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(1);
      expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
    })
  );

  it('should activateLiveDataUpdateDB subscribeToGetData when liveDataUpdate$ is false', fakeAsync(() => {
      service.getDataSubscription.unsubscribe();
      service.liveDataUpdateSubscription.unsubscribe();
      const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
      const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(of(false));

      service.activateLiveDataUpdateDB();
      tick();
      expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(0);
      expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
    })
  );


  it('should subscribeToGetData', fakeAsync(() => {
    const spyOnSelectedCityId$ = spyOnProperty(service, 'selectedCityId$').and.callFake(() => of('cityId'));
    const spyOnGetData = spyOn(service, 'getData').and.callFake(() => of(testData));
    const spyOnStoreDispatch = spyOn(store, 'dispatch').and.callFake((action) => of(action));

    service.getDataSubscription.unsubscribe();
    service.subscribeToGetData();

    expect(spyOnSelectedCityId$).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(1);
    
    tick(ConstantsService.loadingDataDebounceTime_ms);
    
    expect(spyOnStoreDispatch).toHaveBeenCalledTimes(1);
    service.getDataSubscription.unsubscribe();
  }));
});

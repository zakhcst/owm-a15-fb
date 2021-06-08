import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { DbOwmService } from './db-owm.service';
import { MockAngularFireService } from './testing.services.mocks';
import { AngularFireDatabase } from '@angular/fire/database';
import { IOwmDataModel } from '../models/owm-data.model';
import { getNewDataObject } from './testing.services.mocks';
import { NgxsModule, Store } from '@ngxs/store';
import { of, Subscription } from 'rxjs';
import { ConstantsService } from './constants.service';

describe('DbOwmService', () => {
  const testData: IOwmDataModel = getNewDataObject();
  let service: DbOwmService;
  let mockAngularFireService: MockAngularFireService;
  const cityId = 'cityId';

  beforeEach(
    waitForAsync(() => {
      mockAngularFireService = new MockAngularFireService();
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([])],
        providers: [
          DbOwmService, 
          Store, 
          { provide: AngularFireDatabase, useValue: mockAngularFireService }],
      });
      service = TestBed.inject(DbOwmService);
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
  }));

  it('should updateCache', () => {
    const spySetOwmDataCache = spyOn(service['_utils'], 'setOwmDataCache');
    service.updateCache(testData);
    expect(spySetOwmDataCache).toHaveBeenCalledTimes(1);
  });

  it('should activateLiveDataUpdateDB subscribeToGetData when liveDataUpdate$ is true', fakeAsync(() => {
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(of(true));
    service.getDataSubscription = new Subscription();

    service.activateLiveDataUpdateDB();
    tick(10);
    expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(1);
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should activateLiveDataUpdateDB subscribeToGetData when liveDataUpdate$ is false', fakeAsync(() => {
    service.liveDataUpdateSubscription.unsubscribe();
    const spyOnSubscribeToGetData = spyOn(service, 'subscribeToGetData');
    const spyOnLiveDataUpdate$ = spyOnProperty(service, 'liveDataUpdate$').and.returnValue(of(false));
    
    service.activateLiveDataUpdateDB();
    tick(10);
    expect(spyOnSubscribeToGetData).toHaveBeenCalledTimes(0);
    expect(spyOnLiveDataUpdate$).toHaveBeenCalledTimes(1);
  }));

  it('should subscribeToGetData', fakeAsync(() => {
    const spyOnSelectedCityId$ = spyOnProperty(service, 'selectedCityId$').and.callFake(() => of('cityId'));
    const spyOnGetData = spyOn(service, 'getData').and.callFake(() => of(testData));
    const spyOnUpdateCache = spyOn(service, 'updateCache');
    
    service.subscribeToGetData();
    tick(ConstantsService.loadingDataDebounceTime_ms);
    expect(spyOnSelectedCityId$).toHaveBeenCalledTimes(1);
    expect(spyOnGetData).toHaveBeenCalledTimes(1);
    expect(spyOnUpdateCache).toHaveBeenCalledTimes(1);
  }));
});
